import Header from "../components/Header"

interface Props{
    children: React.ReactNode;
}

const Layout = ({children}: Props) => {
    return (
        <div className="flex flex-col">
            <Header/>
            <div className="flex-1 max-w-screen-lg mx-auto w-full">
                {children}
            </div>
        </div>
    )
}

export default Layout