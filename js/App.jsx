import React, { useEffect, useRef, useState } from 'react';
import { Range, getTrackBackground } from 'react-range';
import './App.css';
let ffmpeg; //Store the ffmpeg instance
function App() {
    const inputFile = useRef(null);
    const mountedVideoFile = useRef(null);
    const clearTimerRef = useRef();
    const STEP = 1;
    const [values, setValues] = React.useState([0, 900]);
    const [min, setMin] = React.useState(0);
    const [max, setMax] = React.useState(900);
    const [videoFileValue, setVideoFileValue] = React.useState();
    const onButtonClick = () => {
        // `current` points to the mounted file input element
        inputFile?.current?.click();
    };
    const onFileChange = (event) => {
        console.info(event.target.files[0]);
        setVideoFileValue(event.target.files[0]);
        var video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = function () {
            window.URL.revokeObjectURL(video.src);
            var duration = video.duration;
            console.info('duration : ', duration);
            setValues([0, Math.trunc(duration)]);
            setStartTime(0);
            setMin(0);
            setEndTime(Math.trunc(duration));
            setMax(Math.trunc(duration));
        };
        video.src = URL.createObjectURL(event.target.files[0]);
        ;
    };
    // trim part code
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [videoTrimmedUrl, setVideoTrimmedUrl] = useState('');
    const [endTime, setEndTime] = useState(900);
    const [startTime, setStartTime] = useState(0);
    //Created to load script by passing the required script and append in head tag
    const loadScript = (src) => {
        return new Promise((onFulfilled, _) => {
            const script = document.createElement('script');
            let loaded;
            script.async = 'async';
            script.defer = 'defer';
            script.setAttribute('src', src);
            script.onreadystatechange = script.onload = () => {
                if (!loaded) {
                    onFulfilled(script);
                }
                loaded = true;
            };
            script.onerror = function () {
                console.log('Script failed to load');
            };
            document.getElementsByTagName('head')[0].appendChild(script);
        });
    };
    //Convert the time obtained from the video to HH:MM:SS format
    const convertToHHMMSS = (val) => {
        const secNum = parseInt(val, 10);
        let hours = Math.floor(secNum / 3600);
        let minutes = Math.floor((secNum - hours * 3600) / 60);
        let seconds = secNum - hours * 3600 - minutes * 60;
        if (hours < 10) {
            hours = '0' + hours;
        }
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        if (seconds < 10) {
            seconds = '0' + seconds;
        }
        let time;
        // only mm:ss
        //   if (hours === '00') {
        //     time = minutes + ':' + seconds;
        //   } else {
        time = hours + ':' + minutes + ':' + seconds;
        //   }
        return time;
    };
    //Trim functionality of the video
    const handleTrim = async () => {
        if (isScriptLoaded) {
            const { name, type } = videoFileValue;
            //Write video to memory
            ffmpeg.FS('writeFile', name, await window.FFmpeg.fetchFile(videoFileValue));
            const videoFileType = type.split('/')[1];
            //Run the ffmpeg command to trim video
            await ffmpeg.run('-i', name, '-ss', `${convertToHHMMSS(startTime)}`, '-to', `${convertToHHMMSS(endTime)}`, '-acodec', 'copy', '-vcodec', 'copy', `out.${videoFileType}`);
            //Convert data to url and store in videoTrimmedUrl state
            const data = ffmpeg.FS('readFile', `out.${videoFileType}`);
            const url = URL.createObjectURL(new Blob([data.buffer], { type: videoFileValue.type }));
            console.info('trimmed url : ', url, data);
            setVideoTrimmedUrl(url);
        }
    };
    useEffect(() => {
        //Load the ffmpeg script
        loadScript('https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.2/dist/ffmpeg.min.js').then(() => {
            if (typeof window !== 'undefined') {
                // creates a ffmpeg instance.
                ffmpeg = window.FFmpeg.createFFmpeg({ log: true });
                // Load ffmpeg.wasm-core script
                ffmpeg.load();
                // Set true that the script is loaded
                setIsScriptLoaded(true);
            }
        });
    }, []);
    return (<div className='footage-page background'>
            {/* <h1 className='add-footage-title text-3xl font-bold flex justify-center'>Add Footage</h1> */}
            <div className='add-footage-form container mx-auto padding-6'>
                {/* <div className='title-row flex w-full gap-36 pt-6'>
            <div className='row w-1/2'>
                <div className='title relative'>
                    <label>Title:</label>
                    <input className='flex text-input w-full mt-2' type='text' placeholder='Enter title' />
                    <p className='limit-count'>0/50</p>
                </div>
            </div>
            <div className='row w-1/2'>
                <div className='Visibility'>
                    <label>Visibility:</label>
                    <select className='flex text-input w-full mt-2 visibility-select'>
                        <option>Public</option>
                        <option>Private</option>
                    </select>
                </div>
            </div>
        </div>
        <div className='row w-full pt-6'>
            <div className='description relative'>
                <label>Description</label>
                <textarea maxLength={250} className='flex text-input textarea-input w-full mt-2' placeholder='Enter brief description about footage.' />
                <p className='limit-count'>0/250</p>
            </div>
        </div> */}
                <div className='row pt-6'>
                    {!videoFileValue && (<div className='video'>
                            <label className='p-2'>Video</label>
                            <label className='video-label mt-2' onClick={onButtonClick}>
                                <span className='video-select'/>
                                <span>Please upload landscape video for better experience (Max 15 Min)</span>
                            </label>
                            <input type='file' accept="video/mp4,video/x-m4v,video/*" id='file' ref={inputFile} style={{ display: 'none' }} onChange={onFileChange}/>
                        </div>)}
                    {videoFileValue && (<video className='video-preview' height={338} controls ref={mountedVideoFile}>
                            <source src={URL.createObjectURL(videoFileValue)}></source>
                        </video>)}
                    {videoFileValue && (<div style={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap'
            }}>
                            <Range values={values} step={STEP} min={min} max={max} rtl={false} onChange={(values) => {
                if (values.length > 0) {
                    clearTimeout(clearTimerRef.current);
                    setStartTime(values[0]);
                    setEndTime(values[1]);
                    if (mountedVideoFile?.current) {
                        (mountedVideoFile?.current).currentTime = values[0];
                    }
                    if (clearTimerRef) {
                        clearTimerRef.current = setTimeout(() => {
                            handleTrim();
                        }, 3000);
                    }
                }
                setValues(values);
            }} renderTrack={({ props, children }) => (<div onMouseDown={props.onMouseDown} onTouchStart={props.onTouchStart} style={{
                    ...props.style,
                    height: '36px',
                    display: 'flex',
                    width: '100%'
                }}>
                                        <div ref={props.ref} style={{
                    height: '5px',
                    width: '100%',
                    borderRadius: '4px',
                    background: getTrackBackground({
                        values,
                        colors: ['#ccc', '#313336', '#ccc'],
                        min: min,
                        max: max,
                        rtl: false
                    }),
                    alignSelf: 'center'
                }}>
                                        {children}
                                        </div>
                                    </div>)} renderThumb={({ props, isDragged }) => (<div {...props} style={{
                    ...props.style,
                    height: '15px',
                    width: '15px',
                    borderRadius: '50px',
                    border: '1px solid #c5c5c5',
                    backgroundColor: '#313336',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0px 2px 6px #AAA'
                }}>
                                    </div>)}/>
                            <div className='flex justify-between w-full mt-4'>
                                <span>Start Time: {convertToHHMMSS(startTime)} </span>
                                <span>End time: {convertToHHMMSS(endTime)}</span>
                            </div>
                        </div>)}
                </div>
                {/* <div className='row flex w-full pt-6 pb-6 justify-between'>
            <div className='cancel-btn ml-8'>
                <button>Cancel</button>
            </div>
            <div className='submit-btn mr-8'>
                <button>Submit</button>
            </div>
        </div> */}
            </div>
        </div>);
}
export default App;
