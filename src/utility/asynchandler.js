const asyncHandler=(requestHandler)=>{
  return (req,res,next)=>{
    Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
}
}
// const asyncHandler=(fn(req,res,next))=>async()=>{
//     try{
//         fn(req,res,next)
//     }
//     catch(error){
//   res.status(err.code||500).json({
//     success:false,
//     message:err.message
//   })
//     }
// }
export {asyncHandler}