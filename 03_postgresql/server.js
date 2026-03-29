import express from "express";
import { db } from "./db.js";
import { cars } from "./schema.js";
import { eq } from "drizzle-orm";

const app = express();
const PORT = 3000;

const router = express.Router();

app.use(express.json());

// let cars = [
//   { id: 1, make: "Toyota", model: "Camry", year: 2022, price: 28000 },
//   { id: 2, make: "Tesla", model: "Model S", year: 2023, price: 25000 },
//   { id: 3, make: "Ford", model: "F-150", year: 2021, price: 35000 },
// ];

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("Hello from Car API!");
});

router.get("/cars", async (req, res) => {
  try {
    const allCars = await db.select().from(cars);
    res.json(allCars);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cars" });
  }
});

router.post("/cars", async (req, res) => {
  const { make, model, year, price } = req.body;

  if (!make || !model || !year || !price) {
    return res.status(400).json({
      error: "Please provide make, model, year, and price",
    });
  }

  const [newcar] = await db.insert(cars).values({
    make,
    model,
    year: parseInt(year),
    price: parseFloat(price),
  }).returning();

  res.status(201).json(newcar);
});

router.put("/cars/:id", (req, res) => {
  const carId = parseInt(req.params.id);
  const carIndex = cars.findIndex((c) => c.id === carId);

  if (carIndex === -1) {
    return res.status(404).json({ error: "Car not found" });
  }

  const { make, model, year, price } = req.body;

  if (make) cars[carIndex].make = make;
  if (model) cars[carIndex].model = model;
  if (year) cars[carIndex].year = parseInt(year);
  if (price) cars[carIndex].price = parseFloat(price);

  res.json(cars[carIndex]);
});

router.delete("/cars/:id", (req, res) => {
  const carId = parseInt(req.params.id);
  const carIndex = cars.findIndex((c) => c.id === carId);

  if (carIndex === -1) {
    return res.status(404).json({ error: "Car not found" });
  }

  const deletedCar = cars.splice(carIndex, 1)[0];

  res.json({
    message: "Car deleted successfully",
    car: deletedCar,
  });
});

router.get("/cars/:id", async (req, res) => {
  try {
    const carId = parseInt(req.params.id);
    const [car] = await db.select().from(cars).where(eq(cars.id, carId));
    
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }
    
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch car" });
  }
});

app.use("/api/v1", router);

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
