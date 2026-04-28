const Error = ({text}:{text:string}) =>{
    return (
        <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="text-red-600 dark:text-red-400 text-xl mb-2">⚠️</div>
                <p className="text-red-600 dark:text-red-400">{text}</p>
            </div>
        </div>
    )
}

export default Error