const shortid=require("shortid")
const validurl=require("valid-url")

const redis=require('redis')
const {promisify}=require('util')

const urlModel=require("../models/urlModel")
const{isValid,isVAlidRequestBody,urlRegex,baseUrlRegex}=require('../validator/validation')




const redisClient = redis.createClient(
    13123,
    "redis-13123.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
  );
  redisClient.auth("rq5x8BDeuGaerKjxUQakKG4BrpzfXh63", function (err) {
    if (err) throw err;
  });
  
  redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
  });
  


const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



const createUrl=async function(req,res){
    try {
        const body=req.body

        if(!isVAlidRequestBody(body)) return res.status(400).send({status:false,message:"Please provide data to create Url"})

        const { longUrl }=body

        if(!isValid(longUrl)) return res.status(400).send({status:false,message:"The longUrl is mandatory and Should have non empty string"})
        
        let cachedUrlData = await GET_ASYNC(`${longUrl}`)

        if(cachedUrlData){
            return res.status(200).send({status:false, message:'This Url is already in Cache', redisData: JSON.parse(cachedUrlData)})
        }

        const getlongUrl=await urlModel.findOne({longUrl:longUrl})

        // if(getlongUrl) return res.status(400).send({status:false,message:`Use this shorturl ${getlongUrl.shortUrl} of this longUrl as this longUrl is already Exist`})

         if(!urlRegex.test(longUrl)) return res.status(400).send({status:false,message:"Please give the long url in valid Formate"})

         if(getlongUrl){
            await SET_ASYNC(`${longUrl}`, JSON.stringify(getlongUrl))
            return res.status(200).send({status:false, message:"This Url is already Registered in DB", data:getlongUrl})
        }

        let baseUrl='http://localhost:3000'

        if(!baseUrlRegex.test(baseUrl)) return res.status(400).send({status:false,message:"Please give the baseurl in valid Formate"})
       
        let urlCode=shortid.generate().toLowerCase()

        let shortUrl=baseUrl+'/'+urlCode

        const obj={
            longUrl:longUrl,
            urlCode:urlCode,
            shortUrl:shortUrl,
        }
        const createUrl=await urlModel.create(obj)
        return res.status(201).send({status:true,data:obj})

    } catch (error) {
       return res.status(500).send({error:error.message}) 
    }
}


const getUrlCode = async function(req,res){

        try {

        let urlCode = req.params.urlCode

        let findUrlCache=await GET_ASYNC(`${urlCode}`)
        if(findUrlCache){

            return res.status(302).redirect(JSON.parse(findUrlCache))

        }

        let findUrl = await urlModel.findOne({urlCode:urlCode}) 
        
        if(!findUrl) return res.status(404).send({status:false, message:`This ${req.params.urlCode} Url Code is not found.`})

        let findUrl1=findUrl.longUrl

        await SET_ASYNC(`${urlCode}`, JSON.stringify(findUrl1))
        res.status(302).redirect( findUrl1)
    
        return res.status(302).redirect(findUrl1)     

} 
catch (error) {
        return res.status(500).send({error:error.message})     
    }
}


module.exports={createUrl,getUrlCode}