class Environment {
    private static _instance: Environment;
    public static instance(): Environment {
        if (Environment._instance === undefined) {
            Environment._instance = new Environment();
        }
        return Environment._instance;
    }

    private constructor() {
    }

    public get mobile(): boolean {
        const mobileAgents = [
            /Android/i,
            /webOS/i,
            /iPhone/i,
            /iPad/i,
            /iPod/i,
            /BlackBerry/i,
            /Windows Phone/i
        ];
        
        return mobileAgents.some((mobileAgent) => {
            return navigator.userAgent.match(mobileAgent);
        });
    }
}
const environment = Environment.instance();
export default environment;
