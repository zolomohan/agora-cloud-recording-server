const express = require("express");
const app = express();
const axios = require("axios");
app.use(express.json());

const Authorization = `Basic ${Buffer.from(`${process.env.RESTkey}:${process.env.RESTsecret}`).toString("base64")}`;

app.get("/", (req, res) => res.send("Agora Cloud Recording Server"));

app.post("/acquire", async (req, res) => {
  const acquire = await axios.post(
    `https://api.agora.io/v1/apps/${process.env.appID}/cloud_recording/acquire`,
    {
      cname: req.body.channel,
      uid: req.body.uid,
      clientRequest: {
        resourceExpiredHour: 24,
      },
    },
    { headers: { Authorization } }
  );

  res.send(acquire.data);
});

app.post("/start", async (req, res) => {
  const appID = process.env.appID;
  const resource = req.body.resource;
  const mode = req.body.mode;

  const start = await axios.post(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/mode/${mode}/start`,
    {
      cname: req.body.channel,
      uid: req.body.uid,
      clientRequest: {
        recordingConfig: {
          maxIdleTime: 30,
          streamTypes: 2,
          channelType: 0,
          videoStreamType: 0,
          transcodingConfig: {
            height: 640,
            width: 360,
            bitrate: 500,
            fps: 15,
            mixedVideoLayout: 1,
            backgroundColor: "#FFFFFF",
          },
        },
        recordingFileConfig: {
          avFileType: ["hls"],
        },
        storageConfig: {
          vendor: 1,
          region: 2,
          bucket: process.env.bucket,
          accessKey: process.env.accessKey,
          secretKey: process.env.secretKey,
          fileNamePrefix: ["directory1", "directory2"],
        },
      },
    },
    { headers: { Authorization } }
  );

  res.send(start.data);
});

app.post("/stop", async (req, res) => {
  const appID = process.env.appID;
  const resource = req.body.resource;
  const sid = req.body.sid;
  const mode = req.body.mode;

  const stop = await axios.post(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/stop`,
    {
      cname: req.body.channel,
      uid: req.body.uid,
      clientRequest: {},
    },
    { headers: { Authorization } }
  );
  res.send(stop.data);
});

app.post("/query", async (req, res) => {
  const appID = process.env.appID;
  const resource = req.body.resource;
  const sid = req.body.sid;
  const mode = req.body.mode;

  const query = await axios.get(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/query`,
    { headers: { Authorization } }
  );

  res.send(query.data);
});

app.post("/updateSubscription", async (req, res) => {
  const appID = process.env.appID;
  const resource = req.body.resource;
  const sid = req.body.sid;
  const mode = req.body.mode;

  const updateSubscription = await axios.get(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/update`,
    {
      cname: req.body.channel,
      uid: req.body.uid,
      clientRequest: {
        streamSubscribe: {
          audioUidList: req.body.audioSubscription,
          videoUidList: req.body.videoSubscription,
        },
      },
    },
    { headers: { Authorization } }
  );

  res.send(updateSubscription.data);
});

app.post("/updateLayout", async (req, res) => {
  const appID = process.env.appID;
  const resource = req.body.resource;
  const sid = req.body.sid;
  const mode = req.body.mode;

  const body = {
    cname: req.body.channel,
    uid: req.body.uid,
    clientRequest: {
      mixedVideoLayout: req.body.layout,
      backgroundColor: req.body.backgroundColor,
    },
  };

  if (req.body.layoutConfig === 3) {
    body.clientRequest.layoutConfig = req.body.layoutConfig;
  }

  const updateLayoutConfig = await axios.get(
    `https://api.agora.io/v1/apps/${appID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/${mode}/updateLayout`,
    body,
    { headers: { Authorization } }
  );

  res.send(updateLayoutConfig.data);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Agora Cloud Recording Server listening at Port ${port}`));
