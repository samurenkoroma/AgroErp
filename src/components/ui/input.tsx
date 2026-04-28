import * as React from "react";

import {cn} from "./utils";

function Input({className, type, ...props}: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white  placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors border-gray-300 dark:border-gray-700",
                className,
            )}
            {...props}
        />
    );
}

export {Input};
