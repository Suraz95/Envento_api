const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const { Products } = require("./modals/Products");
app.use(cors());
app.use(express.json());
app.listen("8000", () => {
  console.log("server is running on port 8000");
});
app.get("/", (req, res) => {
  res.send("ok");
});
const db =
  "mongodb+srv://shaiksuraz50:fqJTIurnRnDHHAeP@cluster0.yuml5wf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(db)
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((err) => {
    console.log(err);
  });
app.post("/add-category", async (req, res) => {
  const { cat_name, subCategories } = req.body;

  try {
    let category = await Products.findOne({ cat_name });

    if (category) {
      // Category exists, check for subcategories
      let subCategoryExists = false;
      subCategories.forEach((subCat) => {
        const existingSubCat = category.subCategories.find(
          (sc) => sc.subCat_name === subCat.subCat_name
        );

        if (existingSubCat) {
          // Subcategory exists
          subCategoryExists = true;
          return res
            .status(200)
            .json({
              message: "Subcategory already exists",
              subCategory: existingSubCat,
            });
        } else {
          // Add new subcategory
          category.subCategories.push(subCat);
        }
      });

      if (!subCategoryExists) {
        await category.save();
        return res.status(201).json(category);
      }
    } else {
      // Create new category with subcategories
      category = new Products({
        cat_name,
        subCategories,
      });
      const savedCategory = await category.save();
      return res.status(201).json(savedCategory);
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
app.get("/Products", async (req, res) => {
  try {
    const categories = await Products.find({}, "cat_name subCategories");

    if (!categories) {
      return res.status(404).json({ message: "No categories found" });
    }

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
