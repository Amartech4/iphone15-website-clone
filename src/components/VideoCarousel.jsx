import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);
import { useEffect, useRef, useState } from "react";

import { hightlightsSlides } from "../constants";
import { pauseImg, playImg, replayImg } from "../utils";


function VideoCarousel() {
    const videoRef = useRef([]);
    const videoSpanRef = useRef([]);
    const videoDivRef = useRef([]);

    const [video, setVideo] = useState({
        isEnd: false,
        startPlay: false,
        videoId: 0,
        isLastVideo: false,
        isPlaying: false
    })

    const { isEnd, startPlay, videoId, isLastVideo, isPlaying } = video
    const [loadedData, setLoadedData] = useState([])

    useGSAP(() => {
        // slider animation to move the video out of the screen and bring the next video in
        gsap.to("#slider", {
            transform: `translateX(${-100 * videoId}%)`,
            duration: 2,
            ease: "power2.inOut", // show visualizer https://gsap.com/docs/v3/Eases
          });
    
        // video animation to play the video when it is in the view
        gsap.to("#video", {
          scrollTrigger: {
            trigger: "#video",
            toggleActions: "restart none none none",
          },
          onComplete: () => {
            setVideo((pre) => ({
              ...pre,
              startPlay: true,
              isPlaying: true,
            }));
          },
        });
      }, [isEnd, videoId]);

      

    useEffect(() => {
       if(loadedData.length > 3) {
           if(!isPlaying) {
               videoRef.current[videoId].pause();
           } else {
               startPlay && videoRef.current[videoId].play();
            }
       }
    }, [startPlay, videoId, isPlaying, loadedData])

    useEffect(() => {
        let currentProgress = 0
        let span = videoSpanRef.current

        if(span[videoId]) {
            
            let anim = gsap.to(span[videoId], {
                onUpdate: () => {
                    const progress = Math.ceil(anim.progress() * 100);

                    if(progress != currentProgress ) {
                        currentProgress = progress

                        gsap.to(videoDivRef.current[videoId], {
                            width: window.innerWidth < 760 ? "10vw" :  window.innerWidth < 1200 ? "10vw" : "4vw",
                        })

                        gsap.to(span[videoId], {
                            width: `${currentProgress}%`,
                            backgroundColor: "white",
                        })
                    }
                },

                onComplete: () => {
                    if (isPlaying) {
                        gsap.to(videoDivRef.current[videoId], {
                          width: "12px",
                        });
                        gsap.to(span[videoId], {
                          backgroundColor: "#afafaf",
                        });
                      }
                }
            })

            if (videoId == 0) {
                anim.restart();
              }
        
              // update the progress bar
              const animUpdate = () => {
                anim.progress(
                  videoRef.current[videoId].currentTime /
                    hightlightsSlides[videoId].videoDuration
                );
              };
        
              if (isPlaying) {
                // ticker to update the progress bar
                gsap.ticker.add(animUpdate);
              } else {
                // remove the ticker when the video is paused (progress bar is stopped)
                gsap.ticker.remove(animUpdate);
              }
        }

    }, [videoId, startPlay])

    const handleProcess = (type, i) => {
        switch(type) {
            case 'video-end':
                setVideo((pre) => ({ ...pre, isEnd: true, videoId: i + 1 }))
                break;
            case 'video-last':
                setVideo((pre) => ({ ...pre, isLastVideo: true }))
                break;
            case 'video-reset':
                setVideo((pre) => ({ ...pre, isLastVideo: false, videoId: 0 }))
                break;
            case "pause":
                setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }));
                break;
            case 'play':
                setVideo((pre) => ({ ...pre, isPlaying: !pre.isplaying }))
                break;
            default:
                return video;
        }
    }

    const handleLoadedMetaData = (i, e) => setLoadedData((pre) => [...pre, e]);

  return (
    <>
    <div className='flex items-center'>
        {hightlightsSlides.map((list, i) => (
            <div key={list.id} id="slider"  className='sm:pr-20 pr-10'>
                <div className='video-carousel_container'>
                    <div className='w-full h-full flex-center rounded-3xl overflow-hidden bg-black'>
                        <video 
                        id='video'
                        playsInline={true}
                        preload='auto'
                        className={`${
                            list.id === 2 && "translate-x-44"
                          } pointer-events-none`}
                        muted={true}
                        ref={(el) => (videoRef.current[i] = el)}
                        onPlay={() => {
                            setVideo((prevVideo) => ({ 
                                ...prevVideo,
                                isPlaying: true
                            }))
                        }}
                        onEnded={() =>
                            i !== 3
                              ? handleProcess("video-end", i)
                              : handleProcess("video-last")
                          }
                        
                        onLoadedMetadata={(e) => handleLoadedMetaData(i, e)}
                        >
                            <source src={list.video} type="video/mp4" />
                        </video>
                    </div>

                    <div className='absolute top-12 left-[5%] z-10'>
                        {list.textLists.map((text) => (
                            <p key={text} className='md:text-2xl text-xl font-medium'>{text}</p>
                        ))}
                    </div>
                </div>
            </div>
        ))}
    </div>

    <div className='relative flex-center mt-10'>
        <div className='flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full'>
            {videoRef.current.map((_, i) => (
                <span
                key={i}
                ref={(el) => (videoDivRef.current[i] = el)}
                className='mx-2 w-3 h-3 rounded-full bg-gray-200 relative cursor-pointer'
                >
                    <span className='absolute h-full w-full rounded-full bg-gray-200' ref={(el) => (videoSpanRef.current[i] = el)} />

                </span>
            ))}
        </div>
         


        <button className='control-btn'>
            <img src={isLastVideo ? replayImg : isPlaying ? playImg : pauseImg} alt={isLastVideo ? 'replay' : !isPlaying ? 'play' : 'pause'} 
            onClick={isLastVideo ? () => handleProcess("video-reset") 
                : !isPlaying ? () => handleProcess("play")
                : () => handleProcess("pause")


            }
            />
        </button>
    </div>
    </>
  )
}

export default VideoCarousel