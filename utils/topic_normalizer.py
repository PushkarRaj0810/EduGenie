def normalize_topic(topic):

    topic = topic.strip()

    topic_map = {
        "Key Components of Web Development": "Web Development",
        "Types of Web Development": "Web Development",
        "Web Development Strategies": "Web Development",
        "Introduction to Web Development": "Web Development",
        "Basics of Web Development": "Web Development",

        "Introduction to Neural Networks": "Neural Networks",
        "Basics of Neural Networks": "Neural Networks",

        "Introduction to Machine Learning": "Machine Learning",
        "Basics of Machine Learning": "Machine Learning",
    }

    return topic_map.get(topic, topic)

