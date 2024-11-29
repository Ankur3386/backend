import {asyncHandler} from "../utility/asyncHandler.js"
import {ApiError} from "../utility/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utility/cloudinary.js"
import {ApiResponse} from "../utility/ApiResponse.js"
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

const existedUser= User.findOne({
  $or:[username,email]
})
if(existedUser){
  throw new ApiError(409,"user with email or password already existed")
}
//checking for files withfiles which we got from middleware-multrer(upload) 
const avatarLocalPath =req.files?.avatar[0]?.path 
const coverImageLocalPath=req.files?.coverImage[0]?.path
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
  paaword,
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
export {registerUser}