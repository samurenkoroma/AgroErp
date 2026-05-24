export const cropPlanLib = {
    calculateProgress(data: { start: Date, total: number }): number {
        // console.log(new Date().getTime() - data.start);
        const current = (new Date().getTime() - data.start.getTime()) / (1000 * 60 * 60 * 24)

        return +(current * 100 / data.total).toFixed(0);
    }
}