import type { CaseStudyContent } from "./types.ts";

/**
 * Words on the dynamic-folder-structures case study (/portfolio/projects/dynamic-folder-structures/).
 * Edit text here; layout lives in components/case-studies/dynamic-folder-structures.tsx and the
 * project name, pre-title, lead, and banner image live in scripts/project-catalog.mts.
 * Inline formatting: **bold**, *emphasis*, `code`, [label](url), [label](url new-tab).
 */
export const dynamicFolderStructuresContent: CaseStudyContent = {
  description: "An interactive Apple Shortcut that creates a parent folder and a user-defined set of subfolders.",
  sections: [
    {
      id: "problem",
      nav: "A repeatable task worth automating",
      title: "A repeatable task worth automating",
      blocks: [
        "Project resources were easier to organize when they started with a clear folder structure. Manually creating a parent folder and multiple issue folders repeated the same setup work each time.",
        "I built an interactive Apple Shortcut and documented the process so the structure could be created from user inputs.",
      ],
    },
    {
      id: "workflow",
      nav: "How the Shortcut works",
      title: "How the Shortcut works",
      blocks: [
        {
          type: "list",
          ordered: true,
          items: [
            "**Format the date, if useful.** Prepare a date value for the naming convention.",
            "**Ask for the main folder name.** Store the text input in a variable.",
            "**Create the parent folder.** Keep its returned folder reference for subsequent actions.",
            "**Ask how many subfolders are needed.** Use the numeric input as the repeat count.",
            "**Repeat the creation step.** Ask for each name and create the subfolder inside the stored parent.",
          ],
        },
        { type: "heading", level: 3, text: "The detail that makes it work" },
        "The repeated action must use the correct parent folder reference. My guide calls out this dependency when troubleshooting “Unspecified Path” errors.",
      ],
    },
    {
      id: "evidence",
      nav: "Guide & implementation evidence",
      title: "Guide & implementation evidence",
      blocks: [
        "The original guide includes action screenshots, a complete-flow overview, and a comparison of manual and automated setup.",
        {
          type: "button",
          text: "Read the original illustrated guide ↗",
          href: "https://gemsforge.notion.site/Guide-to-Creating-Dynamic-Folder-Structures-in-Apple-Shortcuts-13baeadaba7780d4a09eda95b61891b7",
        },
        {
          type: "code",
          code: `Example inputs
Parent: Demo Sprint
Subfolders: 2
Names: Issue A, Issue B

Expected output
Demo Sprint/
  Issue A/
  Issue B/`,
        },
        "The example above illustrates the intended output; it is not a captured execution result.",
      ],
    },
    {
      id: "validation",
      nav: "Validation & lessons",
      title: "Validation & lessons",
      blocks: [
        "The documented validation checks that the parent folder is created, the requested number of subfolders is generated, and each is nested under the correct parent with the supplied name.",
        "Test in a temporary directory before adapting the workflow to real project files. The guide demonstrates variables, repeat control flow, path management, and technical communication without claiming a measured time-saving result.",
      ],
    },
  ],
};
