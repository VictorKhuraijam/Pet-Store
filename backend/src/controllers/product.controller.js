
import { Product } from "../models/product.model.js"
import {uploadOnCloudinary, deleteFromCloudinary} from '../utils/cloudinary.js'
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from '../utils/ApiResponse.js'

// function for add product
const addProduct = asyncHandler(async (req, res) => {
    const { name, description, price, category, type, bestseller } = req.body

    if(!name || !description || !price || !category || !type) {
        throw new ApiError(400, "All fields are required")
    }

    const image1 = req.files?.image1?.[0]
    const image2 = req.files?.image2?.[0]
    const image3 = req.files?.image3?.[0]
    const image4 = req.files?.image4?.[0]

    const images = [image1, image2, image3, image4].filter((item) => item !== undefined)

    if (!images.length) {
        throw new ApiError(400, "At least one image is required")
    }

    let imagesData = await Promise.all(
        images.map(async (item) => {
           const result = await uploadOnCloudinary(item.path)
           console.log("Cloudinary upload result:", result)
           if(!result){
            throw new ApiError(500, "Error uploading image to cloudinary")
           }
           return {
            url: result.url
           }
        })
    )
    console.log("Images data Array:", imagesData)

    const product = await Product.create({
        name,
        description,
        category,
        type,
        price: Number(price),
        bestseller: bestseller === "true",
        images: imagesData
    })

    if(!product){
        throw new ApiError(500, "Something went wrong while creating the product")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            product,
            "Product Added Successfully"
        )
    )


})

// function for updating product
const updateProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params
    const { name, description, price, category, type, bestseller } = req.body

    // Find the product to update
    const product = await Product.findById(productId)

    if (!product) {
        throw new ApiError(404, "No product found for the given ProductId")
    }

    // Extract original image IDs if provided in request
    const originalImageIds = []
    for (let i = 1; i <= 4; i++) {
        const imageId = req.body[`originalImage${i}`]
        if (imageId && imageId.trim() !== "") {
            originalImageIds.push(imageId)
        }
    }

    // Process new uploaded images
    const image1 = req.files?.image1?.[0]
    const image2 = req.files?.image2?.[0]
    const image3 = req.files?.image3?.[0]
    const image4 = req.files?.image4?.[0]

    const newImages = [image1, image2, image3, image4].filter((item) => item !== undefined)

    // Upload new images to Cloudinary
    let newImagesData = []
    if (newImages.length > 0) {
        newImagesData = await Promise.all(
            newImages.map(async (item) => {
                const result = await uploadOnCloudinary(item.path)
                console.log("Cloudinary upload result for new image:", result)
                if (!result) {
                    throw new ApiError(500, "Error uploading image to cloudinary")
                }
                return {
                    url: result.url,
                    public_id: result.public_id // Store public_id for future reference
                }
            })
        )
        console.log("New images data Array:", newImagesData)
    }

    // Determine which images to retain and which to delete
    let updatedImages = []

    // Keep original images that were marked to be retained
    if (originalImageIds.length > 0) {
        const retainedImages = product.images.filter(image =>
            originalImageIds.includes(image._id.toString()) ||
            (image.public_id && originalImageIds.includes(image.public_id))
        )
        updatedImages = [...retainedImages]
    }

    // Add new images
    updatedImages = [...updatedImages, ...newImagesData]

    // Delete images that are no longer needed
    const imagesToDelete = product.images.filter(image => {
        return !originalImageIds.includes(image._id.toString()) &&
               (!image.public_id || !originalImageIds.includes(image.public_id))
    })

    if (imagesToDelete.length > 0) {
        try {
            const deletionPromises = imagesToDelete.map(image => deleteFromCloudinary(image.url))
            await Promise.all(deletionPromises)
        } catch (error) {
            console.error("Error deleting old images:", error)
            // Continue with update even if image deletion fails
        }
    }

    // If no images are left after processing, throw error
    if (updatedImages.length === 0) {
        throw new ApiError(400, "Product must have at least one image")
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
            name: name || product.name,
            description: description || product.description,
            price: price ? Number(price) : product.price,
            category: category || product.category,
            type: type || product.type,
            bestseller: bestseller === "true" || bestseller === true,
            images: updatedImages
        },
        { new: true }
    )

    if (!updatedProduct) {
        throw new ApiError(500, "Error while updating product")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedProduct,
                "Product updated successfully"
            )
        )
})

// function for list product
const listProducts = asyncHandler(async(req, res) => {

    const products = await Product.find({})

    // Check if no products exist
    if (products.length === 0) {
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { products: [] },
                "No products found"
            )
        );
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {products},
            "Products fetched successfully"
        )
    )
})

// function for removing product
const removeProduct = asyncHandler(async (req, res) => {
    const {productId} = req.params

    const product = await Product.findById(productId)

    if(!product){
        throw new ApiError(400, "No product found for the given ProductId")
    }

      // Extract all public_ids from product images
      const urls = product.images.map(image => image.url)

      // Delete all images from Cloudinary
      try {
          const deletionPromises = urls.map(url => deleteFromCloudinary(url))
          const cloudinaryResults = await Promise.all(deletionPromises)

          // Check if any deletion failed
          const failedDeletions = cloudinaryResults.filter(result => result === null)
          if (failedDeletions.length > 0) {
              throw new ApiError(500, "Failed to delete some images from Cloudinary")
          }
      } catch (error) {
          throw new ApiError(500, "Error while deleting images from Cloudinary")
      }

    const deletedProduct = await Product.findByIdAndDelete(productId)

    if(!deletedProduct){
        throw new ApiResponse(500, "Error while deleting product from database")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                deletedProduct: {
                    name: deletedProduct.name
                }
            },
            "Product successfully deleted"
        )
    )
})

// function for single product info
const getSingleProduct = asyncHandler(async (req, res) => {
    const {productId} = req.params

    const product = await Product.findById(productId)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            product,
            "A product fetched successfully"
        )
    )
})


export {
    addProduct,
    updateProduct,
    listProducts,
    removeProduct,
    getSingleProduct }
