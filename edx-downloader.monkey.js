// ==UserScript==
// @name         edX Downloader
// @name:zh-CN   edX网课下载器
// @name:zh-TW	 edX網課下載器
// @name:ja		 edXダウンローダー
// @namespace    https://github.com/jks-liu/edx-downloader.monkey.js
// @version      1.0.0
// @description  Download edX course mp4 and srt in one click
// @description:zh-CN  一键下载edX网课视频和字幕
// @author       Jks Liu (https://github.com/jks-liu)
// @match        https://edx.org/*
// @match        https://www.edx.org/*
// @match        https://learning.edx.org/*
// @match        https://courses.edx.org/*
// @icon         https://www.google.com/s2/favicons?domain=edx.com
// @grant        GM_download
// ==/UserScript==

// jks_ is the namespace

// The structure is as below
// learning.edx.org -> Containing title
//      ifram, courses.edx.org -> Containing video address


function jks_is_host(site) {
    return window.location.href.indexOf(site) != -1
}


function jks_learning_edu_org() {
    'use strict';
    // TODO
}

function jks_courses_edx_org() {
    'use strict';

    // The content is under an iframe
    // So @match is https://courses.edx.org, not https://learning.edx.org
    // Can not use `window.$` as below ajax, don't know why
    let video = $('.video-download-button')[0];
    let video_url = video.href;

    // Create a button
    let download_all_button = document.createElement("div");
    download_all_button.innerHTML = `
        <label>
            <input id="jks_checkbox_mp4" type="checkbox", checked=true>
            <span>*.mp4</span>
            <input id="jks_checkbox_srt" type="checkbox", checked=true>
            <span>*.srt</span>
            <input id="jks_checkbox_txt" type="checkbox">
            <span>*.txt</span>
        </label>
        <button id="jks_button">Download All</button>
        `;
    // Video download event is at parent element 
    // So add button after parent, or it's button click will be hide by parent
    video.parentElement.append(download_all_button)

    // Cannot use $, don't know why
    let srt_url = document.querySelector("li.transcript-option a").href;

    // Use $ instead of window.$, previously window.$ is ok, don't know why
    $.ajax({
        url: document.querySelector("li.transcript-option a").href,
        type: "HEAD",
        success: function(res, status, xhr) {
            let srt_header = xhr.getResponseHeader("content-disposition");
            // attachment; filename="02_TinyML_C02_03-01-01-en.srt" => 02_TinyML_C02_03-01-01-en.srt
            let srt_file_name = srt_header.slice(22, -1);
            let mp4_file_name = srt_file_name.slice(0, -4)+".mp4";
            let txt_file_name = srt_file_name.slice(0, -4)+".txt";

            $("#jks_button").click(function() {
                if ($("#jks_checkbox_mp4")[0].checked) {
                    // video is CORS (Cross-origin resource)
                    // Set tampermonkey `Download Mode` option to `Browser API`
                    // https://www.tampermonkey.net/faq.php?ext=dhdg#Q302
                    GM_download(video_url, mp4_file_name);
                }

                if ($("#jks_checkbox_srt")[0].checked) {
                    GM_download(srt_url, srt_file_name);
                }

                if ($("#jks_checkbox_txt")[0].checked) {
                // Txt and srt and the same file
                    GM_download(srt_url, txt_file_name);
                }
            })
        }
    })
}

(function() {
    'use strict';

    if (jks_is_host("courses.edx.org")) {
        jks_courses_edx_org();
    }
})();
