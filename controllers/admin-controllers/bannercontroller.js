const { response } = require("../../app");
const adminHelper = require("../../helpers/adminhelper/bannerhelper");
// const orderHelper = require("../../helpers/adminHelpers/orderHelper");

module.exports = {

    // get banner page
    getAddBanner:(req,res)=>
    {
        let admin = req.session.admin
        res.render('admin/add-banner',{layout:'admin-layout',admin})

    },


    // post banner page
   
    postAddBanner: (req, res) => {
        adminHelper.addBanner(req.body, req.file.filename).then((response) => {
          if (response) {
            res.redirect("/admin/add_banner");
          } else {
            res.status(505);
          }
        });
      },

    //   list banner
    listBanner :(req,res) =>
    {
        adminHelper.listBanner().then((response)=>
        {
            admin = req.session.admin
            res.render('admin/list-banner',{layout:'admin-layout',admin,response})
        })
    },


    // delete banner
    deleteBanner:(req,res)=>
    {
        adminHelper.deleteBanner(req.params.id).then((response)=>
        {
            res.json(true)
        })
    },

    // edit banner
    getEditBanner:(req,res)=>
    { 
      
      adminHelper.EditBanner(req.query.banner).then((response)=>
      {
        let admin = req.session.admin
        res.render('admin/edit-banner',{layout:'admin-layout',admin,response})
      })
    }, 


  // post edit banner

  postEditBanner: (req, res) => {
    adminHelper
      .postEditBanner(req.query.editbanner, req.body, req?.file?.filename)
      .then((response) => {
        res.redirect("/admin/list_banner");
      });
  },
}