import { useState } from 'react';
import Image from 'next/image';
import MainButton from '@/components/UI/button';
import Input from '@/components/UI/input';
import Passport from '@/components/Passport';
import GridWithRays from '@/components/GridWithRays';
import { useRouter } from 'next/router';

export default function TestPage() {
    const [selectedStyleId, setSelectedStyleId] = useState(1);
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [progressMessage, setProgressMessage] = useState('');
    const [activePassportTab, setActivePassportTab] = useState(1);
    const [finalPassport, setFinalPassport] = useState<{ nickname: string; avatarUrl: string; citizenId: number } | null>(null);

    const stylesToShow = [
        { id: 1, src: '/avatars/default-male.png' },
        { id: 2, src: '/avatars/default-female.png' },
    ];

    const router = useRouter();

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 gap-4">
            {finalPassport ? (
                <>
                    <GridWithRays />
                    <h1 className="text-3xl font-bold">Your Passport is Ready!</h1>
                    <div className="flex space-x-4">
                        {[1, 2, 3].map((tab) => (
                            <MainButton
                                key={tab}
                                variant={activePassportTab === tab ? "solid" : "outline"}
                                onClick={() => setActivePassportTab(tab)}
                                className="w-10 h-10 flex items-center justify-center text-lg"
                            >
                                {tab}
                            </MainButton>
                        ))}
                    </div>
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-60 h-80 rounded-full bg-main filter blur-[80px]"></div>
                        <Passport
                            className="z-1"
                            nickname={finalPassport.nickname}
                            gender={gender}
                            avatarUrl={
                                activePassportTab === 1
                                    ? finalPassport.avatarUrl
                                    : activePassportTab === 2
                                        ? "/placeholder-avatar-2.svg"
                                        : "/placeholder-avatar-3.svg"
                            }
                            citizenId={finalPassport.citizenId}
                        />
                    </div>
                    <MainButton variant="solid" onClick={() => router.push("/")}>Enter the City</MainButton>
                </>
            ) : (
                <>
                    <h1 className="text-3xl font-bold mb-4 animate-pulse">Forging Your Passport...</h1>

                    <div className="relative flex items-center justify-center">
                        {/* Blurred glow behind the passport */}
                        <div className="absolute w-60 h-80 rounded-full bg-main filter blur-[100px] opacity-70 animate-pulse" />

                        {/* Passport placeholder that will update automatically once finalPassport is ready */}
                        {(() => {
                            const selectedStyle = stylesToShow.find((s) => s.id === selectedStyleId);
                            const placeholderAvatar = selectedStyle?.src || '/default-avatar.svg';
                            return (
                                <div className="relative">
                                    <Passport
                                        className="z-10 animate-pulse"
                                        nickname={progressMessage ? '...' : 'Forging'}
                                        gender={gender}
                                        avatarUrl={placeholderAvatar}
                                    />

                                    {/* Overlay shimmer to indicate forging */}
                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-[16px]">
                                        <p className="text-white text-center px-4 animate-pulse">
                                            {progressMessage || 'Generating avatar & citizen name...'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </>
            )}
            <MainButton
                onClick={() => setFinalPassport({ nickname: 'TestUser', avatarUrl: '/avatars/test-avatar.png', citizenId: 1234567890 })}
                className="mt-8"
            >
                Generate Passport
            </MainButton>
        </div>
    );
}
