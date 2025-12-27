from typing import TypeVar, Generic, Union, Callable, Awaitable

# Define Type Variables for the Success (T) and Failure (E) types
T = TypeVar('T')
E = TypeVar('E')

class Result(Generic[T, E]):
    """
    A monadic result type representing either success (Ok) or failure (Err).
    
    This helps in robust error handling by forcing explicit checks for success/failure
    instead of relying on exceptions or magic values (like None).
    """
    
    def __init__(self, value: Union[T, E], is_ok: bool):
        self._value = value
        self._is_ok = is_ok

    @staticmethod
    def ok(value: T) -> 'Result[T, E]':
        """Creates a successful (Ok) Result."""
        return Result(value, True)

    @staticmethod
    def fail(error: E) -> 'Result[T, E]':
        """Creates a failed (Err) Result."""
        return Result(error, False)

    def is_ok(self) -> bool:
        """Returns True if the result is successful."""
        return self._is_ok

    def is_fail(self) -> bool:
        """Returns True if the result is a failure."""
        return not self._is_ok

    @property
    def value(self) -> T:
        """Returns the successful value. Raises AttributeError if it is a failure."""
        if not self._is_ok:
            raise AttributeError("Cannot access value on a failed Result.")
        return self._value

    @property
    def error(self) -> E:
        """Returns the error value. Raises AttributeError if it is a success."""
        if self._is_ok:
            raise AttributeError("Cannot access error on a successful Result.")
        return self._value

    def __repr__(self) -> str:
        if self._is_ok:
            return f"Ok({self._value!r})"
        return f"Err({self._value!r})"

    def unwrap(self) -> T:
        """
        Returns the contained value, consuming the container.
        Raises an exception if the value is an error.
        """
        if self.is_fail():
            raise Exception(f"Attempted to unwrap an error Result: {self.error}")
        return self._value

    def unwrap_or(self, default: T) -> T:
        """
        Returns the contained value or a default value if the result is an error.
        """
        if self.is_ok():
            return self.value
        return default
    
    def unwrap_or_else(self, op: Callable[[E], T]) -> T:
        """
        Returns the contained value or computes it from the error value.
        """
        if self.is_ok():
            return self.value
        return op(self.error)

    # You could add methods like 'map', 'map_err', 'and_then' for more advanced monadic chaining.
    # For a basic fix, the above is sufficient.
    
# --- Common utility function for async operations (Optional, but often useful) ---
# F = TypeVar('F', bound=Callable[..., Awaitable[Result]])
# 
# def as_async_result(func: F) -> F:
#     """Decorator to ensure an async function returns a Result, handling exceptions."""
#     async def wrapper(*args, **kwargs):
#         try:
#             # Assuming func returns a Result type
#             return await func(*args, **kwargs)
#         except Exception as e:
#             # Catch unhandled exceptions and convert to an Err result
#             return Result.fail(str(e))
#     return wrapper # type: ignore