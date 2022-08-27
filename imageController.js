import { Router } from 'express'
import { getImageLogic } from './imageLogic.js'
import { MimeTypes, CRS_EPSG4326, BBox } from '@sentinel-hub/sentinelhub-js';
function getRandomNumber(min, max) {

  const num = Math.floor(Math.random() * (max - min + 1) + min);
  return num.toString();
}

const getImagerouter = new Router()
export const imageRouter = getImagerouter.get("/:_width/:_height/:_format/:_maxCloudCoverage", async (req, res) => {

  try {

    const getDefaultMapParams = {
      bbox: new BBox(CRS_EPSG4326, 34.20523,
        29.286399,
        35.832407,
        33.26625),
      fromTime: new Date(getRandomNumber(2017, 2020) + '-0' + getRandomNumber(1, 9) + '-24T00:00:00Z'),
      toTime: new Date(getRandomNumber(2021, 2022) + '-0' + getRandomNumber(1, 9) + '-24T23:59:59Z'),
      width: 512,
      height: 698.082,
      format: MimeTypes.JPEG,
    }




    let imageParams = {
      bbox: getDefaultMapParams.bbox,
      fromTime: getDefaultMapParams.fromTime,
      toTime: getDefaultMapParams.toTime,
      width: req.params._width ? Number(req.params._width) : Number(getDefaultMapParams.width),
      height: req.params._height ? req.params._height : getDefaultMapParams.height,
      format: req.params._format ? 'image/' + req.params._format : getDefaultMapParams.format,
      maxCloudCoverage: req.params._maxCloudCoverage ? req.params._maxCloudCoverage : '30',
      imageData: {}
    }
    const image = await getImageLogic(imageParams);
    res.json(image);
  }
  catch (err) {
    res.status(500).send(err.message);
  }
});
