/**
 * @ngdoc directive
 * @name com.2fdevs.videogular.plugins.dash.directive:vgHls
 * @restrict A
 * @description
 * Adds HLS support for vg-media.
 * This plugin requires hls.js file available at hls.js project:
 * https://github.com/dailymotion/hls.js
 *
 * <pre>
 * <videogular vg-theme="config.theme.url" vg-autoplay="config.autoPlay">
 *    <vg-media vg-src="sources" vg-hls></vg-media>
 * </videogular>
 * </pre>
 *
 */
"use strict";
angular.module("com.2fdevs.videogular.plugins.hls", [])
    .directive("vgHls", ['$log', function ($log) {
        return {
            restrict: "A",
            require: "^videogular",
            link: function (scope, elem, attr, API) {
                var context;
                var player;
                var hlsTypeRegEx = /^application\/x-mpegURL/i;

                //Proceed augmenting behavior only if the browser is capable of playing HLS
                if(Hls.isSupported()) {
                    //Returns true if the source has the standard HLS type defined OR an .m3u8 extension.
                    scope.isHLS = function isHLS(source) {
                        var hasHlsType = hlsTypeRegEx.test(source.type);
                        var hasHlsExtension = source.src.indexOf && (source.src.indexOf(".m3u8") > 0);

                        return hasHlsType || hasHlsExtension;
                    };

                    scope.onSourceChange = function onSourceChange(source) {
                        var url = source.src;

                        // It's HLS, we use Hls.js
                        if (scope.isHLS(source)) {
                            var video = API.mediaElement[0];
                            var hls = new Hls();
                            hls.loadSource(url);
                            hls.attachMedia(API.mediaElement[0]);
                            hls.on(Hls.Events.MANIFEST_PARSED,function() {
                                if(API.autoPlay){
                                    video.play();
                                }
                            });
                        }
                        else if (player) {
                            //not HLS, but the Hls.js player is still wired up
                            //Dettach Hls.js from the mediaElement
                            player.reset();
                            player = null;

                            //player.reset() wipes out the new url already applied, so have to reapply
                            API.mediaElement.attr('src', url);
                            API.stop();
                        }
                    };

                    scope.$watch(
                        function () {
                            return API.sources;
                        },
                        function (newVal/*, oldVal*/) {
                            scope.onSourceChange(newVal[0]);
                        }
                    );
                }
            }
        }
    }
    ]);
