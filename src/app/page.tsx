import Image from 'next/image';
import VisitorCount from "./components/VisitorCount";
import React from 'react';



export default function Home() {
  // fetch live visitor count on every request

  const count = 123; // replace with actual fetch logic
  return (
    
    <main className="flex min-h-screen flex-col items-center p-24">
      {/* banner */}
      <div className="flex flex-col" >
        <div style={{width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 12, display: 'inline-flex'}}>
          <div style={{justifyContent: 'center', alignItems: 'center', gap: 12, display: 'inline-flex'}}>
            <div style={{color: '#E6E6E6', fontSize: 20, fontFamily: 'Montserrat', fontWeight: '500', wordWrap: 'break-word'}}>Visitors since launch:</div>
            <div style={{color: 'var(--Main, #FED48A)', fontSize: 20, fontFamily: 'Montserrat', fontWeight: '600', wordWrap: 'break-word'}}>100000</div>
          </div>
          <div style={{alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center', gap: 12, display: 'inline-flex', flexWrap: 'wrap', alignContent: 'center'}}>
            <div style={{color: '#E6E6E6', fontSize: 64, fontFamily: 'Monument Extended', fontWeight: '800', letterSpacing: 1.92, wordWrap: 'break-word'}}>ANTHROPOS CITY</div>
            <img style={{width: 72, height: 72}} src="https://placehold.co/72x72" />
          </div>
        </div>
      </div>
      <div className="w-full max-w-[1120px] inline-flex justify-start items-center gap-6">
    <div className="self-stretch px-5 py-4 rounded-xl outline outline-1 outline-offset-[-1px] outline-Main inline-flex flex-col justify-between items-center">
        <img className="w-24 h-24" src="https://placehold.co/99x100" />
        <div className="self-stretch flex flex-col-reverseflex-col justify-start items-start gap-1.5">
            <div className="self-stretch justify-start text-zinc-400 text-base font-medium font-['Montserrat']">Price</div>
            <div className="justify-start text-neutral-200 text-2xl font-bold font-['Montserrat']">$0.00000003</div>
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
            <div className="self-stretch justify-start text-zinc-400 text-base font-medium font-['Montserrat']">Volume 24h</div>
            <div className="self-stretch justify-start text-neutral-200 text-2xl font-bold font-['Montserrat']">$594</div>
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
            <div className="self-stretch justify-start text-zinc-400 text-base font-medium font-['Montserrat']">Variation 24h</div>
            <div className="self-stretch justify-start text-neutral-200 text-2xl font-bold font-['Montserrat']">10.2%</div>
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
            <div className="self-stretch justify-start text-zinc-400 text-base font-medium font-['Montserrat']">Market Cap</div>
            <div className="self-stretch justify-start text-neutral-200 text-2xl font-bold font-['Montserrat']">$500k</div>
        </div>
        <div className="self-stretch px-4 py-3 bg-amber-200 rounded-md inline-flex justify-center items-center gap-1.5">
            <div className="justify-start text-black text-base font-semibold font-['Montserrat']">BUY NOW</div>
        </div>
    </div>
    <div className="flex-1 px-5 py-4 rounded-xl outline outline-1 outline-offset-[-1px] outline-Main flex justify-center items-start gap-4">
        <div className="flex-1 self-stretch max-w-80 bg-zinc-300" />
        <div className="flex-1 h-96 max-h-96 inline-flex flex-col justify-start items-start gap-4 overflow-hidden">
            <div className="self-stretch h-36 bg-stone-800 rounded-xl border border-amber-200" />
            <div className="self-stretch h-36 bg-stone-800 rounded-xl border border-amber-200" />
            <div className="self-stretch h-36 bg-stone-800 rounded-xl border border-amber-200" />
        </div>
    </div>
</div>
<div className="self-stretch px-5 inline-flex flex-col justify-start items-center gap-10">
    <div className="inline-flex justify-start items-center gap-3">
        <div className="justify-start text-amber-200 text-3xl font-bold font-['Inter']">City Assets</div>
        <div className="flex justify-start items-center">
            <div className="justify-start text-amber-200 text-3xl font-bold font-['Inter']">0</div>
            <div className="justify-start text-neutral-200 text-3xl font-bold font-['Inter']">/100</div>
        </div>
    </div>
    <div className="w-full h-48 max-w-[1120px] inline-flex justify-start items-center gap-5 overflow-hidden">
        <div className="w-64 px-5 py-4 rounded-xl outline outline-1 outline-offset-[-1px] outline-stone-800 inline-flex flex-col justify-start items-start gap-3">
            <div className="inline-flex justify-start items-center gap-3">
                <img className="w-9 h-9" src="https://placehold.co/36x36" />
                <div className="justify-start text-neutral-200 text-2xl font-semibold font-['Montserrat']">Zinzino</div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <div className="justify-start text-zinc-400 text-base font-medium font-['Montserrat']">Total Investment</div>
                <div className="justify-start text-neutral-200 text-xl font-bold font-['Montserrat']">$1562</div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <div className="justify-start text-zinc-400 text-base font-medium font-['Montserrat']">ACT Tokens</div>
                <div className="justify-start text-neutral-200 text-xl font-bold font-['Montserrat']">7,777,777,777</div>
            </div>
        </div>
        <div className="w-64 px-5 py-4 rounded-xl outline outline-1 outline-offset-[-1px] outline-stone-800 inline-flex flex-col justify-start items-start gap-3">
            <div className="inline-flex justify-start items-center gap-3">
                <img className="w-9 h-9" src="https://placehold.co/36x36" />
                <div className="justify-start text-neutral-200 text-2xl font-semibold font-['Montserrat']">Zinzino</div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <div className="justify-start text-zinc-400 text-base font-medium font-['Montserrat']">Total Investment</div>
                <div className="justify-start text-neutral-200 text-xl font-bold font-['Montserrat']">$1562</div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <div className="justify-start text-zinc-400 text-base font-medium font-['Montserrat']">ACT Tokens</div>
                <div className="justify-start text-neutral-200 text-xl font-bold font-['Montserrat']">7,777,777,777</div>
            </div>
        </div>
        <div className="w-64 px-5 py-4 rounded-xl outline outline-1 outline-offset-[-1px] outline-stone-800 inline-flex flex-col justify-start items-start gap-3">
            <div className="inline-flex justify-start items-center gap-3">
                <img className="w-9 h-9" src="https://placehold.co/36x36" />
                <div className="justify-start text-neutral-200 text-2xl font-semibold font-['Montserrat']">Zinzino</div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <div className="justify-start text-zinc-400 text-base font-medium font-['Montserrat']">Total Investment</div>
                <div className="justify-start text-neutral-200 text-xl font-bold font-['Montserrat']">$1562</div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <div className="justify-start text-zinc-400 text-base font-medium font-['Montserrat']">ACT Tokens</div>
                <div className="justify-start text-neutral-200 text-xl font-bold font-['Montserrat']">7,777,777,777</div>
            </div>
        </div>
        <div className="w-64 px-5 py-4 rounded-xl outline outline-1 outline-offset-[-1px] outline-stone-800 inline-flex flex-col justify-start items-start gap-3">
            <div className="inline-flex justify-start items-center gap-3">
                <img className="w-9 h-9" src="https://placehold.co/36x36" />
                <div className="justify-start text-neutral-200 text-2xl font-semibold font-['Montserrat']">Zinzino</div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <div className="justify-start text-zinc-400 text-base font-medium font-['Montserrat']">Total Investment</div>
                <div className="justify-start text-neutral-200 text-xl font-bold font-['Montserrat']">$1562</div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <div className="justify-start text-zinc-400 text-base font-medium font-['Montserrat']">ACT Tokens</div>
                <div className="justify-start text-neutral-200 text-xl font-bold font-['Montserrat']">7,777,777,777</div>
            </div>
        </div>
        <div className="w-64 px-5 py-4 rounded-xl outline outline-1 outline-offset-[-1px] outline-stone-800 inline-flex flex-col justify-start items-start gap-3">
            <div className="inline-flex justify-start items-center gap-3">
                <img className="w-9 h-9" src="https://placehold.co/36x36" />
                <div className="justify-start text-neutral-200 text-2xl font-semibold font-['Montserrat']">Zinzino</div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <div className="justify-start text-zinc-400 text-base font-medium font-['Montserrat']">Total Investment</div>
                <div className="justify-start text-neutral-200 text-xl font-bold font-['Montserrat']">$1562</div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
                <div className="justify-start text-zinc-400 text-base font-medium font-['Montserrat']">ACT Tokens</div>
                <div className="justify-start text-neutral-200 text-xl font-bold font-['Montserrat']">7,777,777,777</div>
            </div>
        </div>
    </div>
</div>


    </main>
  );
}