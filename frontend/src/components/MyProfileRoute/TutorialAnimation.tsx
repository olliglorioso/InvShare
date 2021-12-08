import React from "react";
import { AnimateKeyframes } from "react-simple-animate";
import { Arrow90degUp } from "react-bootstrap-icons";
import {Typography} from "@material-ui/core";
import useStyles from "./myProfileRouteStyles.module";

// This component is responsible for rendering the tutorial animation for first purchase in the MyProfile-page.

const TutorialAnimation = () => {
    // Importing styles.
    const styles = useStyles();
    // Render the animation. Animation is created with AnimateKeyframes of react-simple-animate-library.
    return (
        <div style={{ background: "white" }}>
            <div className={styles.animationSizes}>
                <AnimateKeyframes
                    play
                    iterationCount="infinite"
                    keyframes={["opacity: 0", "opacity: 1"]}
                    duration={3}
                >
                    <Arrow90degUp
                        size={50}
                        className={styles.tutorialArrow}
                    />
                    <Typography className={styles.tutorialTypography}>
                        Open the sidebar!
                    </Typography>
                </AnimateKeyframes>
            </div>
            <div className={styles.tutorialMainText}>
                <Typography>
                    You have bought no stocks. Follow the instructions and glinting
                    objects in order to buy one.
                </Typography>
            </div>
        </div>
    );
};

export default TutorialAnimation;