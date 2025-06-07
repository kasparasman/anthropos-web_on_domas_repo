export type StyleItem = {
    id: string;
    src: string;
    alt: string;
};

// The following maleStyles array uses the URLs from the styleRef.md context, 
// mapped to the 9 style slots. I chose an order that puts the most "complete" or "true" styles first, 
// and then fills in the rest, as per your context notes. 
// Each style gets a descriptive alt for accessibility and clarity.

export const maleStyles: StyleItem[] = [
    {
        id: "m1",
        src: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/styleref_male_creator.png",
        alt: "Male Creator Style"
    },
    {
        id: "m2",
        src: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/styleref_male_trader.png",
        alt: "Male Trader Style"
    },
    {
        id: "m3",
        src: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/styleref_male_explorer.png",
        alt: "Male Explorer Style"
    },
    {
        id: "m4",
        src: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/styleref_male_nurturer.png",
        alt: "Male Nurturer Style"
    },
    {
        id: "m5",
        src: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/styleref_male_guardian.png",
        alt: "Male Guardian Style"
    },
    {
        id: "m6",
        src: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/styleref_male_innovator.png",
        alt: "Male Innovator Style"
    },
    {
        id: "m7",
        src: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/styleref_male_sage.png",
        alt: "Male Sage Style"
    },
    {
        id: "m8",
        src: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/styleref_male_leader.png",
        alt: "Male Leader Style"
    },
    // If you want a 9th style, but only 8 URLs are provided, you can either repeat one, 
    // leave it blank, or use a placeholder. Here, I use a placeholder.
    {
        id: "m9",
        src: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/styleref_male_communicator.png",
        alt: "Male Communicator Style"
    }
];

export const femaleStyles: StyleItem[] = [
    {
        id: "f1",
        src: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/styleref_female_creator.png",
        alt: "Female Creator Style"
    },
    {
        id: "f2",
        src: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/styleref_female_trader.png",
        alt: "Female Trader Style"
    },
    {
        id: "f3",
        src: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/styleref_female_explorer.png",
        alt: "Female Explorer Style"
    },
    {
        id: "f4",
        src: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/styleref_female_harmonizer.png",
        alt: "Female Harmonizer Style"
    },
    {
        id: "f5",
        src: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/styleref_female_innovator.png",
        alt: "Female Innovator Style"
    },
    {
        id: "f6",
        src: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/styleref_female_leader.png",
        alt: "Female Leader Style"
    },
    {
        id: "f7",
        src: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/styleref_female_communicator.png",
        alt: "Female Communicator Style"
    },
    {
        id: "f8",
        src: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/styleref_female_sage.png",
        alt: "Female Sage Style"
    },
    {
        id: "f9",
        src: "https://pub-0539ca942f4a457a83573a5585904cba.r2.dev/styleref_female_guardian.png",
        alt: "Female Guardian Style"
    }
];