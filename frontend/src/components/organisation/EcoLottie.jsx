import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export default function EcoLottie({
  animationData,
  loop=true,
  autoplay=true,
  className='',
  fallback=null,
  reducedMotionFallback,
}){
  const hostRef=useRef(null);
  const playerRef=useRef(null);
  const [visible,setVisible]=useState(false);
  const [pageVisible,setPageVisible]=useState(()=>!document.hidden);
  const [data,setData]=useState(typeof animationData==='function'?null:animationData);
  const [Player,setPlayer]=useState(null);
  const [playerReady,setPlayerReady]=useState(false);
  const [playerFailed,setPlayerFailed]=useState(false);
  const reduceMotion=useReducedMotion();

  useEffect(()=>{
    setData(typeof animationData==='function'?null:animationData);
    setPlayerReady(false);
    setPlayerFailed(false);
  },[animationData]);

  useEffect(()=>{
    const host=hostRef.current;if(!host)return;
    if(!('IntersectionObserver' in window)){setVisible(true);return;}
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{rootMargin:'80px'});
    observer.observe(host);return()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    if(!visible||data||typeof animationData!=='function')return;
    let active=true;
    animationData()
      .then(module=>{if(active)setData(module.default||module)})
      .catch(()=>{if(active)setPlayerFailed(true)});
    return()=>{active=false};
  },[animationData,data,visible]);
  useEffect(()=>{
    if(!visible||reduceMotion||Player)return;
    let active=true;
    import('lottie-react')
      .then(module=>{
        const Component=module.default?.default||module.default||module.LottiePlayer;
        if(active&&typeof Component==='function')setPlayer(()=>Component);
        else if(active)setPlayerFailed(true);
      })
      .catch(()=>{if(active)setPlayerFailed(true)});
    return()=>{active=false};
  },[Player,reduceMotion,visible]);
  useEffect(()=>{
    const update=()=>setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange',update);
    return()=>document.removeEventListener('visibilitychange',update);
  },[]);
  useEffect(()=>{
    const player=playerRef.current;
    if(!player)return;
    if(visible&&pageVisible&&autoplay&&!reduceMotion)player.play();
    else player.pause();
  },[autoplay,visible,pageVisible,reduceMotion,data,Player]);

  const staticFallback=reduceMotion?(reducedMotionFallback??fallback):fallback;
  const canRenderPlayer=!reduceMotion&&visible&&pageVisible&&data&&Player&&!playerFailed;
  return <div ref={hostRef} className={`relative isolate min-h-12 min-w-12 ${className}`} aria-hidden="true">
    {/* Keep the lightweight SVG underneath the player. Some malformed or
        partially supported Lottie files emit DOMLoaded but paint no pixels. */}
    <div className="absolute inset-0">
      {staticFallback}
    </div>
    {canRenderPlayer&&<Player
      lottieRef={playerRef}
      animationData={data}
      loop={loop}
      autoplay={autoplay}
      onDOMLoaded={()=>setPlayerReady(true)}
      onDataFailed={()=>setPlayerFailed(true)}
      rendererSettings={{preserveAspectRatio:'xMidYMid meet'}}
      className={`absolute inset-0 z-10 h-full w-full transition-opacity duration-200 ${playerReady?'opacity-100':'opacity-0'}`}
    />}
  </div>;
}
