import { generateOpenGraph } from "@/lib/generateOG"

(async function () {
    await generateOpenGraph()
    console.log("done")
})()