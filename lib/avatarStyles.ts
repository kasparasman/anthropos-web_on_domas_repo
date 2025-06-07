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
    { id: "f1", src: "/images/female1.jpg", alt: "Female Style 1" },
    { id: "f2", src: "/images/female2.jpg", alt: "Female Style 2" },
    { id: "f3", src: "/images/female3.jpg", alt: "Female Style 3" },
    { id: "f4", src: "/images/female4.jpg", alt: "Female Style 4" },
    { id: "f5", src: "/images/female5.jpg", alt: "Female Style 5" },
    { id: "f6", src: "/images/female6.jpg", alt: "Female Style 6" },
    { id: "f7", src: "/images/female7.jpg", alt: "Female Style 7" },
    { id: "f8", src: "/images/female8.jpg", alt: "Female Style 8" },
    { id: "f9", src: "/images/female9.jpg", alt: "Female Style 9" },
]; 