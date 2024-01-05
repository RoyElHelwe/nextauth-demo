import { getServerSession } from "next-auth"

const page = async () => {
    const session = await getServerSession();
    console.log(session);
    return (
        <div>
            welcome To admin page
        </div>
    )   
}

export default page
