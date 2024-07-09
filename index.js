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
    console.log("connected to mongodb ");
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
app.delete('/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    

    const category = await Products.findOne({ 'subCategories.products._id': productId });
    if (!category) {
      return res.status(404).send('Product not found');
    }

    let subCategory;
    let product;

    category.subCategories.forEach((subcat) => {
      const foundProduct = subcat.products.id(productId);
      if (foundProduct) {
        subCategory = subcat;
        product = foundProduct;
      }
    });

    if (!subCategory || !product) {
      return res.status(404).send('Product not found');
    }

    subCategory.products.pull(productId);

    // if no product left iin subcategory then remove the subcategory if it's now empty
    if (subCategory.products.length === 0) {
      category.subCategories.pull(subCategory._id);
    }

      // if no product left iin subcategory then remove the subcategory if it's now empty
    if (category.subCategories.length === 0) {
      await Products.findByIdAndDelete(category._id);
    } else {
      await category.save();

    }

    res.send('Product deleted successfully');
  } 
  catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
}); 
// update product with categroy,subcategory,product id and product details

app.put("/update-product", async (req, res) => {
  const {
    oldCat_name,
    oldSubCat_name,
    prod_id,
    updatedCategory,
    updatedSubCategory,
    updatedProduct,
  } = req.body;

  try {
    const category = await Products.findOne({ cat_name: oldCat_name });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    let subCategory;
    if (oldSubCat_name) {
      subCategory = category.subCategories.find(
        (sc) => sc.subCat_name == oldSubCat_name
      );

      if (!subCategory) {
        return res.status(404).json({ message: "Subcategory not found" });
      }
    }

    let product;
    if (prod_id) {
      product = subCategory.products.id(prod_id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
    }

    //to update category only
    // input - oldCat_name,updatecategory:{"new category input"}
    if (updatedCategory) {
      category.cat_name = updatedCategory.cat_name || category.cat_name;
    }

    // to update subcategory only
    // input - Cat_name,oldSubCat_name,updateSubCategory:{"new subcategory input"}
    if (updatedSubCategory) {
      subCategory.subCat_name =
        updatedSubCategory.subCat_name || subCategory.subCat_name;
    }

    // to update product only
    //input- category,subcategory,proudct_id,and updateProduct:{"new proudct details"}
    if (updatedProduct) {
      Object.assign(product, updatedProduct);
    }

    await category.save();
    return res.status(200).json({ message: "Update successful", category });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

