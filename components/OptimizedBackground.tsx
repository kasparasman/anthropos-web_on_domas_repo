import Image from 'next/image'
import { useRouter } from 'next/router'

const OptimizedBackground = () => {
    const router = useRouter()

    const showBackgroundOn = ['/', '/register2', '/users/[nickname]']
    const shouldShow = showBackgroundOn.some(path => {
        if (path.includes('[')) {
            return router.pathname === path
        }
        return router.pathname === path
    })

    if (!shouldShow) return null

    return (
        <div className="h-full flex fixed justify-between items-end bottom-0 z-[-2] absolute overflow-hidden inset-0 pointer-events-none">
            <div className="hidden lg:block ml-[-100px] relative w-[400px] h-full">
                <Image
                    src="/BurjKalifa.png"
                    alt="background"
                    fill
                    className="object-contain opacity-100 pointer-events-none"
                    priority
                    sizes="400px"
                />
            </div>
            <div className="hidden flex lg:block lg:mr-[-400px] relative w-[600px] h-full items-end">
                <Image
                    src="/Building2.png"
                    alt="background"
                    fill
                        className="object-cover object-left opacity-100 pointer-events-none"
                    priority
                    sizes="600px"
                />
            </div>
            {/* Keep people.png as CSS background for repeat-x functionality */}
            {router.pathname === '/' && (
                <div
                    className="w-full absolute z-[1] bottom-[-40px] left-0 pointer-events-none"
                    style={{
                        backgroundImage: 'url(/people.png)',
                        backgroundRepeat: 'repeat-x',
                        backgroundPosition: 'bottom',
                        backgroundSize: 'auto 100%',
                        height: '200px',
                    }}
                    aria-hidden="true"
                />
            )}
        </div>
    )
} 

export default OptimizedBackground;