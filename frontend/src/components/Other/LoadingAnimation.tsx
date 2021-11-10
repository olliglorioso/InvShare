import React from "react"
import ReactLoading, { LoadingType } from "react-loading"

const LoadingAnimation = ({type, color}: {type: string, color: string}): JSX.Element => {
    return <ReactLoading type={type as LoadingType} color={color} height={"10%"} width={"10%"} />
}

export default LoadingAnimation
