import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    title: "Find A Practitioner",
    path: "/find-practitioner",
    newTab: false,
  },
  {
    id: 2,
    title: "Find A Clinic",
    path: "/clinics",
    newTab: false,
  },
  {
    id: 3,
    title: "Event",
    path: "/events",
    newTab: false,
  },
  {
    id: 4,
    title: "Blog",
    path: "/blog",
    newTab: false,
    // submenu: [
    //   {
    //     id: 31,
    //     title: "Videos",
    //     path: "/",
    //     newTab: false,
    //   },
    //   {
    //     id: 32,
    //     title: "Articles",
    //     path: "/blogs",
    //     newTab: false,
    //   },
    // ],
  },
  {
    id: 5,
    title: "Contact Us",
    path: "/contact",
    newTab: false,
  },
];
export default menuData;
