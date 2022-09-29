const shortid=require("shortid")
const validurl=require("valid-url")
const urlModel=require("../models/urlModel")
const{isValid,isVAlidRequestBody,urlRegex}=require('../validator/validation')

const createUrl=async function(req,res){
    try {
        const body=req.body

        if(!isVAlidRequestBody(body)) return res.status(400).send({status:false,message:"Please provide data to create Url"})

        const { longUrl }=body

        if(!isValid(longUrl)) return res.status(400).send({status:false,message:"The longUrl is mandatory and Should have non empty string"})
        
        if(!urlRegex.test(longUrl)) return res.status(400).send({status:false,message:"Please give the url in valid Formate"})

        let baseUrl='https://localhost:3000'

        let urlCode=shortid.generate(longUrl).trim().toLowerCase()
        
        let shortUrl=baseUrl + "/" +urlCode

        const obj={
            longUrl:longUrl,
            urlCode:urlCode,
            shortUrl:shortUrl,
        }
        const createUrl=await urlModel.create(obj)
        return res.status(201).send({status:true,data:createUrl})

    } catch (error) {
       return res.status(500).send({error:error.message}) 
    }
}
const getUrlCode = async function(req,res){

    try {
        let urlCode = req.params.urlCode

        let findUrl = await urlModel.findOne({urlCode:urlCode}) 
        
        if(!findUrl){
            return res.status(404).send({status:false, message:`This ${req.params.urlCode} Url Code is not found.`})
        }
        let findUrl1=findUrl.longUrl
    

        res.status(302).redirect( findUrl1)
        
    } catch (error) {
        return res.status(500).send({error:error.message})     
    }
}


module.exports={createUrl,getUrlCode}