        
        {(() => {
            // Ensure useState is imported at the top of pages/register2.tsx if not already present.
            // import { useState } from 'react';
            const { useState } = React; // Assuming React is imported and useState is available via React.useState
  
            const GenderToggle = () => {
              const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  
              return (
                <div className="flex flex-row items-center gap-4">
                  {/*  ─────── PILL-STYLE TOGGLE ───────  */}
                  <div className="bg-gray rounded-full h-10 w-[220px] flex p-1">
                    <button
                      onClick={() => setSelectedGender('male')}
                      className={`flex-1 flex items-center justify-center rounded-full transition ${
                        selectedGender === 'male'
                          ? "bg-main text-black"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      Male
                    </button>
                    <button
                      onClick={() => setSelectedGender('female')}
                      className={`flex-1 flex items-center justify-center rounded-full transition ${
                        selectedGender === 'female'
                          ? "bg-main text-black"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>
              );
            };
            return <GenderToggle />;
          })()}