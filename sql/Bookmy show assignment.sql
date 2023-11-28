-- # Table Creation
CREATE TABLE `cities` (
  `city_id` bigint PRIMARY KEY AUTO_INCREMENT,
  `city_name` varchar(255) NOT NULL,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `users` (
  `user_id` bigint PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) UNIQUE NOT NULL,
  `mobile` integer UNIQUE NOT NULL,
  `password` varchar(255) NOT NULL,
  `city_id` integer NOT NULL,
  `role` varchar(20) DEFAULT "'customer'" COMMENT 'Use strings for enum-like values',
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `theaters` (
  `theater_id` bigint PRIMARY KEY AUTO_INCREMENT,
  `theater_name` varchar(255) UNIQUE NOT NULL,
  `city_id` integer NOT NULL,
  `no_of_screens` integer NOT NULL,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `screens` (
  `screen_id` bigint PRIMARY KEY AUTO_INCREMENT,
  `screen_name` varchar(255) UNIQUE NOT NULL,
  `theater_id` integer NOT NULL,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `movies` (
  `movie_id` bigint PRIMARY KEY AUTO_INCREMENT,
  `movie_name` varchar(255) NOT NULL,
  `language` varchar(255) DEFAULT "English",
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `movie_info` (
  `movie_info_id` bigint PRIMARY KEY AUTO_INCREMENT,
  `movie_id` integer NOT NULL,
  `director` varchar(255),
  `certificate` varchar(5) DEFAULT "'U'" COMMENT 'Use strings for enum-like values',
  `genere` varchar(255),
  `release_date` varchar(255) NOT NULL,
  `format` varchar(10) DEFAULT "'2D'" COMMENT 'Use strings for enum-like values',
  `description` varchar(255),
  `ticket_price` varchar(20) NOT NULL,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `show_time` (
  `show_time_id` bigint PRIMARY KEY AUTO_INCREMENT,
  `screen_id` integer NOT NULL,
  `start_time` timestamp NOT NULL,
  `end_time` timestamp NOT NULL,
  `date` date,
  `movie_id` integer NOT NULL,
  `theater_id` integer NOT NULL,
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);

CREATE TABLE `seats` (
  `seat_id` bigint PRIMARY KEY AUTO_INCREMENT,
  `show_time_id` integer NOT NULL,
  `row_letter` varchar(5) NOT NULL,
  `seat_number` integer NOT NULL,
  `actual_seat_no` VARCHAR(255) GENERATED ALWAYS AS (CONCAT(`row_letter`, LPAD(`seat_number`, 3, '0'))) STORED,
  `created_at` timestamp DEFAULT now(),
  `updated_at` timestamp DEFAULT now(),
  `expiry_time` timestamp,
  UNIQUE KEY `unique_seat` (`show_time_id`, `row_letter`, `seat_number`)
);

CREATE TABLE `bookings` (
  `booking_id` bigint PRIMARY KEY AUTO_INCREMENT,
  `show_time_id` integer NOT NULL,
  `user_id` integer NOT NULL,
  `no_of_tickets` integer NOT NULL,
  `seat_no` varchar(255) NOT NULL,
  `tot_amount` integer NOT NULL,
  `is_completed` boolean DEFAULT false,
  `payment_intent` varchar(255),
  `created_at` timestamp DEFAULT (now()),
  `updated_at` timestamp DEFAULT (now())
);


-- # Table Constraints

ALTER TABLE `users` ADD FOREIGN KEY (`city_id`) REFERENCES `cities` (`city_id`);

ALTER TABLE `theaters` ADD FOREIGN KEY (`city_id`) REFERENCES `cities` (`city_id`);

ALTER TABLE `screens` ADD FOREIGN KEY (`theater_id`) REFERENCES `theaters` (`theater_id`);

ALTER TABLE `show_time` ADD FOREIGN KEY (`theater_id`) REFERENCES `theaters` (`theater_id`);

ALTER TABLE `show_time` ADD FOREIGN KEY (`screen_id`) REFERENCES `screens` (`screen_id`);

ALTER TABLE `show_time` ADD FOREIGN KEY (`movie_id`) REFERENCES `movies` (`movie_id`);

ALTER TABLE `movie_info` ADD FOREIGN KEY (`movie_id`) REFERENCES `movies` (`movie_id`);

ALTER TABLE `bookings` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `bookings` ADD FOREIGN KEY (`show_time_id`) REFERENCES `show_time` (`show_time_id`);

ALTER TABLE `seats` ADD FOREIGN KEY (`show_time_id`) REFERENCES `show_time` (`show_time_id`);

-- # Table Indexing

-- Indexing show_time table's below columns has we have two queries which is heavily joined in fetching movies running in a theater or list of theaters for a movie which is a very frequent operation.
CREATE INDEX idx_movie_theater_screen_id
ON show_time (`movie_id`, `theater_id`, `screen_id` );


-- Indexed movie_id column in movie_info table since we fetch movie information which would be displayed to user before they proceed with ticket booking
CREATE INDEX idx_movie_id ON movie_info(`movie_id`);

-- Also have created index on seat table, index named unique_seat for columns `show_time_id`, `row_letter`, `seat_number` which helps in filtering of booked seats query

-- # Stored Procedure

-- Responsible for archiving seats after show completion, deletes after 1hr of show's end time
CREATE DEFINER=`root`@`localhost` PROCEDURE `RemoveExpiredSeatsProcedure`()
BEGIN
  DELETE seats
  FROM seats
  INNER JOIN show_time ON seats.show_time_id = show_time.show_time_id
  WHERE ADDTIME(show_time.end_time, '01:00:00') <= NOW();
END