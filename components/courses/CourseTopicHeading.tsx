interface CourseTopicHeadingProps {
  heading: string;
}

export function CourseTopicHeading({ heading }: CourseTopicHeadingProps) {
  if (!heading) return null;

  return (
    <p className="mb-3 text-sm font-medium text-frame-silver">{heading}</p>
  );
}
