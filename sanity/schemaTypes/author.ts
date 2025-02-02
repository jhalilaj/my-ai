import {defineField, defineType} from "sanity";
import {UserIcon} from "lucide-react";


export const author = defineType( {
    name: "author",
    title: "Author",
    icon: UserIcon,
    type:"document",
    fields: [
        defineField({
            name: 'id',
            type: 'number',
        }),
        defineField({
            name: 'name',
            type: 'string',
        }),
        defineField({
            name: 'username',
            type: 'string',
        }),
        defineField({
            name: 'email',
            type: 'string',
        }),
        defineField({
            name: 'img',
            type: 'url',
        }),
        defineField({
            name: 'bio',
            type: 'text',
        }),
    ],
    preview: {
        select: {
            title: "name",
        },
    },
 });