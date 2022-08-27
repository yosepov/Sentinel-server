import { S2L2ALayer, setAuthToken, ApiType, MimeTypes, CRS_EPSG4326, BBox } from '@sentinel-hub/sentinelhub-js';
import * as dotenv from 'dotenv'
import axios from "axios";
import qs from "qs";

dotenv.config()

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

const instance = axios.create({
  baseURL: "https://services.sentinel-hub.com"
})

const config = {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
  }
}

const body = qs.stringify({
  client_id,
  client_secret,
  grant_type: "client_credentials"
})


export const getImageLogic = (options) => {
  return new Promise((res, rej) => {


    // All requests using this instance will have an access token automatically added
    let accessKey;
    instance.post("/oauth/token", body, config).then(resp => {
      Object.assign(instance.defaults, {
        headers: { authorization: `Bearer ${resp.data.access_token}` }
      });
      accessKey = resp.data.access_token;

    }).catch(e => console.log(e)).finally(() => setAuthToken(accessKey))





    const evalscript = `//VERSION=3
    
    function setup() {
      return {
        input: ["B02", "B03", "B04"],
        output: { bands: 3 }
      };
    }
    
    function evaluatePixel(sample) {
      return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02];
    }`;

    const layer = new S2L2ALayer({
      evalscript: evalscript,
      maxCloudCoverage: options.maxCloudCoverage ? options.maxCloudCoverage : '30',
    });

    function getRandomNumber(min, max) {

      const num = Math.floor(Math.random() * (max - min + 1) + min);
      return num.toString();
    }

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


    let map = {
      bbox: getDefaultMapParams.bbox,
      fromTime: getDefaultMapParams.fromTime,
      toTime: getDefaultMapParams.toTime,
      width: options.width ? Number(options.width) : getDefaultMapParams.width,
      height: options.height ? Number(options.height) : getDefaultMapParams.height,
      format: options.format ? options.format : getDefaultMapParams.format,
      maxCloudCoverage: options.maxCloudCoverage ? options.maxCloudCoverage : '30',
    }



    layer.getMap(map, ApiType.PROCESSING).then(response => {
      map.imageData = Buffer.from(response, 'base64')

    }).catch(e => console.log('e')).finally(() => res(map));







  });
}