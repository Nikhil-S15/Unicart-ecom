const db= require("../../models/connection");
const bcrypt = require("bcrypt");
const { name } = require("ejs");
const { response } = require("express");


module.exports = {

   
// add banner
  addBanner: (texts, Image) => {

    return new Promise(async (resolve, reject) => {

      let banner = db.banner({
        title: texts.title,
        description: texts.description,
        image: Image

      })
      await banner.save().then((response) => {
        resolve(response)
      })
    })
  },

  // list banner
  listBanner:()=>
  {
    return new Promise(async (resolve, reject) => {
        await db.banner.find().then((response)=>
        {
            resolve(response)
        })
    })
  },

  // delete banner
  deleteBanner:(deleteId)=>
  {
    try {
        return new Promise(async (resolve, reject) => {
            await db.banner.deleteOne({_id:deleteId}).then((response)=>
            {
                resolve(response)
            })
        })
    } catch (error) {
        console.log(error.message);
    }

  },

  // edit banner
  EditBanner:(bannerId)=>
  {
    try {
      return new Promise((resolve, reject) => {
       let bannerid = db.banner.findOne({_id : bannerId}).then((response)=>
        {
          resolve(response)
        })
      })
    } catch (error) {
      console.log(error.message);
    }
  },

  // post edit banner
  postEditBanner:(bannerid, texts, Image)=>
  {
    try {
      return new Promise(async (resolve, reject) => {
        let response = await db.banner.updateOne({_id : bannerid},
          {$set:{ title: texts.title,
            description: texts.description,
            image: Image
          }})
          resolve(response)
      })
    } catch (error) {
      console.log(error.message);
    }
  }
}