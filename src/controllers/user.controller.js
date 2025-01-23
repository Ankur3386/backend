import {asyncHandler} from "../utility/asynchandler.js"
import {ApiError} from "../utility/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utility/cloudinary.js"
import {ApiResponse} from "../utility/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
const generateAccessAndRefreshTokens = async(userId)=>{
  try {
    const user =await User.findById(userId)
    const accessToken =user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()
    user.refreshToken=refreshToken
    user.save({validateBeforeSave:false})
    return {accessToken,refreshToken}
  } catch (error) {
    throw new ApiError(500,"something went wrong with generating access and refresh token")
    
  }
}
const registerUser =asyncHandler(async(req,res)=>{
  // get user data from frontend (we can also get data from postman if no frontend)
  //validation
  //check if user already acess:username and email
  //check for images(avatar -as it is compulsorray)
  //upload them on cloudinary, check avatar uploaded in db
  //create user object - create entry in db
  //remove password and refresh token from response
  //check for user creation
  ////retuen response
  const {username,password,email,fullName}=req.body
  console.log('email:',email);
  //validation -if any of the the fields empty
if(
  [username,password,email,fullName].some((field)=>field?.trim()==="")
)
{
  throw new ApiError(400,"All fields are required");
  
}
//checking if user already existed

const existedUser= await User.findOne({
  $or:[{username},{email}]
});
if(existedUser){
  throw new ApiError(409,"user with email or username already existed")
}
//checking for files withfiles which we got from middleware-multrer(upload) 
const avatarLocalPath =req.files?.avatar[0]?.path 
//const coverImageLocalPath=req.files?.coverImage[0]?.path
let coverImageLocalPath;
if(req.files&&Array.isArray(req.files.coverImage)&&req.files.coverImage.length>0){
  coverImageLocalPath= req.files.coverImage[0].path
}
if(!avatarLocalPath){
  throw new ApiError(400,"Avatar is required")
}
//uploading on cloudinary
const avatar =await uploadOnCloudinary(avatarLocalPath)
const coverImage =await uploadOnCloudinary(coverImageLocalPath)
if(!avatar){
  throw new ApiError(400,"Avatar is required")
}
//creating entery in mongodb
const user =await User.create({
  fullName,
  avatar:avatar.url,
  coverImage:coverImage?.url||"",
  email,
  password,
  username:username.toLowerCase()
})
//selecting id and removing password and refreshtoken
const createdUser=await User.findById(user._id).select("-password -refreshToken")
if(!createdUser){
  throw new ApiError(500,"something went wrong while registering the user")
}
return res.status(201).json(
  new ApiResponse(200,createdUser,"user registered succesfully")
)
  
})
const loginUser=asyncHandler(async(req,res)=>{
  //req body->data
  //valid through email or username
  //find user
  //check password
  //generate access and refresh and access token
  //send access and refresh token through cookies
  const {username,email,password}=req.body
  if(!username&&!email){
    throw new ApiError(400,"username or email is required")
  }
  //find user
  const user =await User.findOne({
    $or:[{username},{email}]
  })
  if(!user){
    throw new ApiError(404,"user not found")
  }
    //check password
const isPsswordValid =await user.isPasswordCorrect(password)
if(!isPsswordValid){
  throw new ApiError(401,"user credentials wrong")
}
const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)
//expensive method as ek aur bar database call kar raha ha
const loggedInUser=await User.findById(user._id).select("-password -refreshToken" )
const options={
  httpOnly :true,
  secure:true
}
return res
.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
  new ApiResponse(
    200,
    {
      user: loggedInUser,accessToken,refreshToken
    },
    "user logged in successfully"
  )
)
})
const logoutUser =  asyncHandler(async(req,res)=>{
//find he user
//delete refreshtoken from database and cookies
await User.findByIdAndUpdate(
  req.user._id,
  {
    $set:{
      refreshToken:undefined
    }
  },
  {
    new:true
  }
)
//deletion of cookies
const options={
  httpOnly :true,
  secure:true
}
return res.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(
  200,{},"user logged out"
))
})
const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
  if(! incomingRefreshToken){
    throw new ApiError(401,"unauthorized request")
  }
  try {
    const decodedToken= jwt.verify(
      incomingRefreshToken,REFRESH_TOKEN_SECRET
    )
    const user =await User.findById(decodedToken?._id)
    if(!user){
      throw ApiError(401,"Invalid Refresh Token")
    }
    if(incomingRefreshToken!== user?.refreshToken)
    {
      throw ApiError(401," Refresh Token is used or expired") 
    }
    const options ={
      httpOnly:true,
      secure:true
    }
    const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
      new ApiResponse(
        200,{accessToken,refreshToken:newRefreshToken},
        "Acess token refreshed"
      )
    )
  } catch (error) {
    throw new ApiError(401,error?.message|| "Invalid Refresh Token")
    
  }
})
const changeCurrentPassword= asyncHandler(async(req,res)=>{
const {oldPassword,newPassword} =req.body
const user = await User.findById(req.user?._id) 
const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)
if(!isPasswordCorrect){
  throw new ApiError(400,"Invalid Password")
}
user.password=newPassword
await user.save({validateBeforeSave:false})
return res.status(200)
.json(new ApiResponse(200,{},"Password changed successfully"))

})
const getCurrentUser = asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json(new ApiResponse(200, req.user,"current user fetched successfully"))
})
const updateAccountdetails =asyncHandler(async(req,res)=>{
  const {fullName,email} =req.body
  if(!fullName||!email){
    throw new ApiError(400,"All files are required")
  }
  const user= User.findByIdAndUpdate(
    req.user?._id,
    {
  $set:{
      fullName,
       email
}
    },
    {new:true}
  ).select("-password")
  return res
  .status(200)
  .json(new ApiResponse(200,user,"Account details updated successfully"))
})
export {registerUser,
  loginUser,
  logoutUser,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser ,
   updateAccountdetails
}
