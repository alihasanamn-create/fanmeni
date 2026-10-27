import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Select=forwardRef(

(
{
label,
error,
options=[],
className,
...props
},
ref
)=>{

return(

<div className="space-y-2">

{label&&(
<label className="text-sm font-medium">
{label}
</label>
)}

<select

ref={ref}

className={cn(

"w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-emerald-600",

className

)}

{...props}

>

<option value="">
Select...
</option>

{options.map(option=>(

<option

key={option.value??option}

value={option.value??option}

>

{option.label??option}

</option>

))}

</select>

{error&&(

<p className="text-sm text-red-500">

{error}

</p>

)}

</div>

);

}

);

Select.displayName="Select";

export default Select;