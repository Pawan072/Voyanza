const Listing = require("../models/listing.js");
const axios = require("axios");




module.exports.index = async(req, res)=>{
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", {allListing});
};

module.exports.renderNewForm = (req, res)=>{ // square brackets replace by curly brackets
    res.render("listings/addnewuser.ejs");
};

module.exports.showListing = async (req, res)=>{
    let{id}= req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate:{path: "author"}}).populate("owner");
    if(!listing){
        req.flash("error", "listing you requested for does not exits!");
        res.redirect("/listings");
    }else{
        // console.log(listing);
        res.render("listings/show.ejs",{listing});
    }

};

module.exports.createListing = async (req, res, next)=>{
    let url = req.file.path;
    let filename = req.file.filename;
    let listing = req.body.listing;
    const newListing = new Listing (listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    console.log(newListing);
    req.flash("success", "New listing was successfully added!");
    res.redirect("/listings");
};

module.exports.createListing =  async (req,res)=>{
 //Create Route


    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
            q: req.body.listing.location,
            format: "json",
            limit: 1,
        },
    });
    


    let url = req.file.path; //need for cloudinary
    let filename = req.file.filename; //need for cloudinary

    const newListing = new Listing(req.body.listing); //abstact all the details
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    
    //but Mongoose GeoJion needs first longitude then latitude (opssite).
    newListing.geometry = {
        type : "Point",
        coordinates: [
            parseFloat(response.data[0].lon),
            parseFloat(response.data[0].lat)
        ]
    };

    let saveListing = await newListing.save();
    console.log(saveListing);
    req.flash("success","New Listings Created !");
    res.redirect("/listings");

};

// module.exports.createListing = async (req, res) => {
//     try {
//         // 1. Use Axios with OpenStreetMap (Nominatim)
//         // Note: Added 'User-Agent' to avoid 403 errors on Render
//         const response = await axios.get("https://nominatim.openstreetmap.org/search", {
//             params: {
//                 q: req.body.listing.location,
//                 format: "json",
//                 limit: 1,
//             },
//             headers: {
//                 'User-Agent': 'VoyanzaProject (your-email@example.com)' // Identify your app
//             }
//         });

//         if (!response.data || response.data.length === 0) {
//             req.flash("error", "Location not found!");
//             return res.redirect("/listings/new");
//         }

//         let url = req.file.path; 
//         let filename = req.file.filename; 

//         const newListing = new Listing(req.body.listing);
//         newListing.owner = req.user._id;
//         newListing.image = { url, filename };

//         // 2. Map coordinates correctly from Axios response
//         newListing.geometry = {
//             type: "Point",
//             coordinates: [
//                 parseFloat(response.data[0].lon),
//                 parseFloat(response.data[0].lat)
//             ]
//         };

//         let saveListing = await newListing.save();
//         req.flash("success", "New Listings Created!");
//         res.redirect("/listings");

//     } catch (err) {
//         console.error("CREATE ERROR:", err);
//         req.flash("error", "Something went wrong while creating listing.");
//         res.redirect("/listings");
//     }
// };



module.exports.renderEditForm = async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "listing you requested for does not exits!");
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload/", "/upload/w_250/")
    res.render("listings/edit.ejs", {listing, originalImageUrl});
    
};

module.exports.updateListing = async (req,res)=>{ //Update Route
    // if(!req.body.listing){
    //     throw new ExpressError(404,"send a valid data for listing");
    // }
    let {id} = req.params;
    let listing =  await Listing.findByIdAndUpdate(id,{ ...req.body.listing}); //deconstruct all data from req.body

    if(typeof req.file !== "undefined"){ // jodi file exist kore thobei ata cholbe na hole cholbe na
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }

    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};



// module.exports.updateListing = async (req, res)=>{
//     let{id} = req.params;
//     let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});   
//     if(typeof req.file !== "undefined"){
//         let url = req.file.path;
//         let filename = req.file.filename;
//         listing.image = {url, filename};
//         await listing.save();
//     }
    
//     req.flash("success", "listing was Updated successfully!");
//     res.redirect(`/listings/${id}`);
// };

module.exports.destroyListing = async (req, res)=>{
    let{id}= req.params;
    let deltedListing = await Listing.findByIdAndDelete(id);
    console.log(deltedListing);
    req.flash("success", "listing was deleted successfully");
    res.redirect("/listings");
};

