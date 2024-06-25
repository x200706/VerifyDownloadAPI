const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
// const path = require('path');
const axios = require("axios");
const app = express();

app.use(bodyParser.json());

// 用於從外部API獲取檔案
async function fetchDataFromAPI(fileName) {
    try {
        const apiUrl = process.env["API"];
        const apiKey = process.env["API_KEY"];
        const response = await axios.get(apiUrl + "?fileName=" + fileName, {
            headers: {
                "x-api-key": apiKey,
            },
        });
        console.log(response.data);
        if (response.data.data && response.data.code === "0000") {
            return response.data.data;
        } else {
            throw new Error("API錯誤訊息：" + response.data.msg);
        }
    } catch (error) {
        throw new Error("外部API獲取資料失敗：" + error.message);
    }
}

app.get("/test", async (req, res) => {
    try {
        const fileName = req.query.fileName;
        const data = await fetchDataFromAPI(fileName);
        const binaryData = Buffer.from(data, "base64");

        // 用sync方法某些格式會壞掉
        fs.writeFile(fileName, binaryData, (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log('File written successfully.');
            }
        });

        res.status(200).json({ code: "200", msg: "API驗證成功" });
    } catch (error) {
        res.status(500).json({
            code: "9999",
            msg: "API驗證失敗",
            error: error.toString(),
        });
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
