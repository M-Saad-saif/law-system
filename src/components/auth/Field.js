function Field({
  label,
  type = "text",
  placeholder,
  required,
  value,
  onChange,
  icon: Icon,
}) {
  return (
    <div className="form-group transform transition-all duration-300 hover:translate-x-1">
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-300 group-focus-within:text-[#0d9488] group-focus-within:scale-110">
          {Icon && (
            <Icon
              size={14}
              className="opacity-50 group-focus-within:opacity-100 transition-opacity"
            />
          )}
        </span>
        <input
          type={type}
          className="w-full pl-10 pr-4 py-2.5 bg-[#f1f5f9]/90 rounded-full text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all duration-300 text-xs shadow-sm"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
        />
      </div>
    </div>
  );
}


function FormField({
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  required = false,
  rightElement = null,
}) {
  return (
    <div className="form-group transform transition-all duration-300 hover:translate-x-1">
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-all duration-300 group-focus-within:text-[#0d9488] group-focus-within:scale-110">
          {Icon && (
            <Icon
              size={14}
              className="opacity-50 group-focus-within:opacity-100 transition-opacity"
            />
          )}
        </span>
        <input
          type={type}
          className="w-full pl-10 pr-4 py-2.5 bg-[#f1f5f9]/90 rounded-full text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-all duration-300 text-xs shadow-sm"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
        />
        {rightElement}
      </div>
    </div>
  );
}

export { Field, FormField };
