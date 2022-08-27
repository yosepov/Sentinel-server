import cors from "cors";
import express from 'express'
import { imageRouter } from './imageController.js'



const app = express();
app.use(cors({ credentials: true, origin: true }));
app.use(express.json())
app.use("/api/maps", imageRouter);
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Listening at port ${PORT}`);
});