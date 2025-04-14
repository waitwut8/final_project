/**
 * @swagger
 * /makeGraph:
 *   get:
 *     summary: Create a chart using Chart.js and black magic.
 *     description: Fetches data from the provided URL, processes it like a data-driven wizard,
 *                  and renders it on a canvas element using Chart.js. Then, it casually logs
 *                  and stores a value in localStorage like it owns the place.
 *     parameters:
 *       - in: query
 *         name: url
 *         schema:
 *           type: string
 *         required: true
 *         description: The API endpoint from which to fetch chart data. Expected to return an array of 3 items.
 *       - in: query
 *         name: ctx
 *         schema:
 *           type: object
 *         required: true
 *         description: The 2D rendering context of the canvas where the chart will live its best life.
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         required: true
 *         description: The type of chart you want (e.g., 'bar', 'line', 'pie', or chaos incarnate).
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         required: true
 *         description: A snazzy label for your dataset, and also the key under which the last data point is stored in localStorage.
 *     responses:
 *       200:
 *         description: Chart was successfully rendered. Data was logged. Local storage was touched.
 */

async function makeGraph(url, ctx, type, title) {
    // Step 1: Beg the API to give us the goods
    const res = await api.get(url); // Just ask nicely. It usually works.

    // Step 2: Summon the chart from the depths of your browser’s soul
    new Chart(ctx, {
        type: type, // Could be 'bar', 'line', 'doughnut'... choose your fighter
        data: {
            labels: res.data[0], // The X-axis labels. You know, the stuff along the bottom.
            datasets: [{
                label: title, // What are we even plotting here? Put it in a label!
                data: res.data[1], // The actual numbers. Aka the reason you're doing all of this.
                borderWidth: 0.25 // Because thicc lines are for amateurs. We like it ✨subtle✨
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true // Because negative sales aren't a thing. Usually.
                }
            },
            aspectRatio: 1.2, // Keeps your chart from looking like a sad pancake
            maintainAspectRatio: false // Say no to squished charts
        }
    });

    // Step 3: Log the mysterious third item from the data. We don't ask what it is. We just vibe.
    console.log(res.data[2], title);

    // Step 4: Store that mystery item in localStorage like a digital squirrel hoarding data
    localStorage.setItem(title, res.data[2]);

    // Step 5: Return the full response, in case someone out there still cares about data integrity
    return res;
}
