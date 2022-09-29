
    const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
    }

    const isVAlidRequestBody = function (requestBody) {
        return Object.keys(requestBody).length > 0
    }

    const urlRegex= /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/+#-]*[\w@?^=%&amp;\/+#-])?/

    module.exports={isValid,isVAlidRequestBody,urlRegex}