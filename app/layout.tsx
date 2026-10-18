import type { ReactNode } from "react";
import "../static-source/assets/site.css";
export const metadata={title:"GemsForge Portfolio",description:"Diamond Brown’s development and systems portfolio"};
export default function RootLayout({children}:{children:ReactNode}){return <html lang="en"><body>{children}</body></html>}
