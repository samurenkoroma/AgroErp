export function PlaceholderPage(title: string) {
    return (
        <div className="p-8 flex items-center justify-center h-full text-card-foreground">
            <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">{title}</h2>
                <p className="text-muted-foreground">Этот раздел находится в разработке</p>
            </div>
        </div>
    );
}