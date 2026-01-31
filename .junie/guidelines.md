# Project Guidelines

## Project Overview
This project is a community management system for a dog training school ("HUNDatfuenfazwanzg3").
It manages:
- **Persons & Members**: Community members and their details.
- **Sales**: Selling articles like drinks and food.
- **Courses**: Tracking paid courses.
- **Credit System**: Persons can charge up credit for future purchases.
- **Rob**: A special daily course requiring pre-registration.

### Main Navigation
- **Sales**: Point of sale interface.
- **Courses**: Course management.
- **Rob**: Registration for the special "Rob" course.
- **Persons**: Member management.
- **Articles**: Product management.

## Tech Stack
- **Framework**: SvelteKit
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database/Auth**: Supabase
- **Icons**: Lucide Svelte
- **UI Library**: Shadcn

## Project Structure
- `src/routes/l`: "Logged-in" area (protected routes).
    - `modules`: Main feature views (lists, dashboards).
    - `dialogs`: Edit/Create forms (modals/pages).
- `src/lib/data`: Data access layer.
    - `hfzSupabaseApi.ts`: Main Supabase interaction class.
    - `hfzApi.ts`: Type definitions and interfaces.

## Naming Conventions
- `hfz` prefix is used for project-specific API classes.
- Dialogs and Modules are separated.

## Key Files
- `src/lib/data/hfzSupabaseApi.ts`: Contains all Supabase queries and logic.
- `src/lib/data/hfzApi.ts`: Contains TypeScript interfaces for the data model.

## Technical
- We use lucide icons, they are imported like this: `import { ArrowLeft } from "@lucide/svelte"`

## Data Model Room
The supabase datamodel looks like this:
```json
{
   "tables":[
      {
         "name":"article",
         "columns":[
            {
               "name":"id",
               "type":"integer",
               "nullable":"NO",
               "default":"nextval('article_id_seq'::regclass)"
            },
            {
               "name":"og",
               "type":"integer",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"title",
               "type":"character varying",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"type",
               "type":"character varying",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"price",
               "type":"numeric",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"isFavorite",
               "type":"boolean",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"extId",
               "type":"character varying",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"isActive",
               "type":"boolean",
               "nullable":"YES",
               "default":null
            }
         ]
      },
      {
         "name":"course_history",
         "columns":[
            {
               "name":"id",
               "type":"integer",
               "nullable":"NO",
               "default":"nextval('course_history_id_seq'::regclass)"
            },
            {
               "name":"personId",
               "type":"integer",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"courses",
               "type":"integer",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"date",
               "type":"date",
               "nullable":"YES",
               "default":null
            }
         ]
      },
      {
         "name":"credit_history",
         "columns":[
            {
               "name":"id",
               "type":"integer",
               "nullable":"NO",
               "default":"nextval('credit_history_id_seq'::regclass)"
            },
            {
               "name":"personId",
               "type":"integer",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"credit",
               "type":"double precision",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"isBought",
               "type":"boolean",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"saleId",
               "type":"integer",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"date",
               "type":"date",
               "nullable":"YES",
               "default":null
            }
         ]
      },
      {
         "name":"person_article_usage",
         "columns":[
            {
               "name":"personId",
               "type":"integer",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"articleId",
               "type":"integer",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"amount",
               "type":"bigint",
               "nullable":"NO",
               "default":null
            }
         ]
      },
      {
         "name":"person",
         "columns":[
            {
               "name":"id",
               "type":"integer",
               "nullable":"NO",
               "default":"nextval('person_id_seq'::regclass)"
            },
            {
               "name":"firstName",
               "type":"character varying",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"lastName",
               "type":"character varying",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"isMember",
               "type":"boolean",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"mainPersonId",
               "type":"integer",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"personGroup",
               "type":"character varying",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"credit",
               "type":"double precision",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"saleCount",
               "type":"integer",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"saleSum",
               "type":"double precision",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"og",
               "type":"integer",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"phone",
               "type":"character varying",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"email",
               "type":"character varying",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"extId",
               "type":"character varying",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"isActive",
               "type":"boolean",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"saleCountActive",
               "type":"integer",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"courseCount",
               "type":"integer",
               "nullable":"NO",
               "default":"0"
            },
            {
               "name":"dogNames",
               "type":"character varying",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"info",
               "type":"character varying",
               "nullable":"YES",
               "default":null
            }
         ]
      },
      {
         "name":"users",
         "columns":[
            {
               "name":"login",
               "type":"character varying",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"pw",
               "type":"character varying",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"og",
               "type":"integer",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"hash",
               "type":"character varying",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"usetop",
               "type":"boolean",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"theme",
               "type":"character varying",
               "nullable":"YES",
               "default":"'system'::character varying"
            },
            {
               "name":"admin",
               "type":"boolean",
               "nullable":"YES",
               "default":"false"
            }
         ]
      },
      {
         "name":"rob_course",
         "columns":[
            {
               "name":"id",
               "type":"integer",
               "nullable":"NO",
               "default":"nextval('rob_course_id_seq'::regclass)"
            },
            {
               "name":"og",
               "type":"integer",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"date",
               "type":"date",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"maxPersons",
               "type":"integer",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"link",
               "type":"character varying",
               "nullable":"YES",
               "default":null
            }
         ]
      },
      {
         "name":"rob_course_person",
         "columns":[
            {
               "name":"id",
               "type":"integer",
               "nullable":"NO",
               "default":"nextval('rob_course_person_id_seq'::regclass)"
            },
            {
               "name":"timestamp",
               "type":"timestamp with time zone",
               "nullable":"YES",
               "default":"CURRENT_TIMESTAMP"
            },
            {
               "name":"robCourseId",
               "type":"integer",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"personName",
               "type":"character varying",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"dogName",
               "type":"character varying",
               "nullable":"YES",
               "default":null
            }
         ]
      },
      {
         "name":"sale",
         "columns":[
            {
               "name":"id",
               "type":"integer",
               "nullable":"NO",
               "default":"nextval('sale_id_seq'::regclass)"
            },
            {
               "name":"og",
               "type":"integer",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"personId",
               "type":"integer",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"personName",
               "type":"character varying",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"saleDate",
               "type":"date",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"articleSum",
               "type":"numeric",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"given",
               "type":"double precision",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"inclTip",
               "type":"double precision",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"toPay",
               "type":"double precision",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"toReturn",
               "type":"double precision",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"usedCredit",
               "type":"boolean",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"addAdditionalCredit",
               "type":"double precision",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"payDate",
               "type":"date",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"extId",
               "type":"character varying",
               "nullable":"YES",
               "default":null
            }
         ]
      },
      {
         "name":"sale_article",
         "columns":[
            {
               "name":"id",
               "type":"integer",
               "nullable":"NO",
               "default":"nextval('sale_article_id_seq'::regclass)"
            },
            {
               "name":"og",
               "type":"integer",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"saleId",
               "type":"integer",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"articleId",
               "type":"integer",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"articleTitle",
               "type":"character varying",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"articlePrice",
               "type":"double precision",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"amount",
               "type":"integer",
               "nullable":"NO",
               "default":null
            }
         ]
      },
      {
         "name":"sale_day",
         "columns":[
            {
               "name":"og",
               "type":"integer",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"day",
               "type":"date",
               "nullable":"NO",
               "default":null
            },
            {
               "name":"payed",
               "type":"numeric",
               "nullable":"YES",
               "default":null
            },
            {
               "name":"toPay",
               "type":"numeric",
               "nullable":"YES",
               "default":null
            }
         ]
      }
   ]
}
```


