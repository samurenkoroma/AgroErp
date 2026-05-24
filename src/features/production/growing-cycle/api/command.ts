

export async function createGrowingCycle(
    data: CreateGrowingCycle
) {
    return api.command(
        'production.create_growing_cycle',
        data
    );
}