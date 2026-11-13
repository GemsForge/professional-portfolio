import type { ReactNode } from "react";
import "../static-source/assets/site.css";

export const metadata={title:"GemsForge Portfolio",description:"Diamond Brown’s development and systems portfolio"};

/** Applies a stored theme choice before first paint so a dark-mode visitor never sees a light flash. */
const themeBoot = `try{var t=localStorage.getItem("gf-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({children}:{children:ReactNode}){return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:themeBoot}} /></head><body>{children}</body></html>}
