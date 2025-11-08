
import dynamic from 'next/dynamic';
const BackgroundStudio = dynamic(()=>import('../src/BackgroundStudio'), { ssr:false });

export default function BackgroundPage(){
  return <BackgroundStudio />;
}
