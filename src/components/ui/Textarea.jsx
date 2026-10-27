import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Textarea=forwardRef(

(
{
label,
error,
rows=4,
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

<textarea

ref={ref}

rows={rows}

className={cn(

"w-full rounded-xl border border-gray-300 px-4 py-3 outline-none resize-none focus:border-emerald-600",

className

)}

{...props}

/>

{error&&(

<p className="text-sm text-red-500">

{error}

</p>

)}

</div>

);

}

);

Textarea.displayName="Textarea";

export default Textarea;