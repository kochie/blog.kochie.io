function ncr(n, r)
	if r > n
		return 0
	end
	return factorial(big(n)) / (factorial(big(r)) * factorial(big(n - r)))
end

function npr(n, r)
	if r > n
		return 0
	end
	return factorial(big(n)) / factorial(big(n - r))
end


"""
This is where we cache values already computed
"""
_master_table = Dict{Function, Dict}()


"""
	_save(f::Function, x, val::BigInt)
Save the computed value of `f` with argument(s) `x` and value `val`.
"""
function _save(f::Function, x, val::BigInt)
	d = _master_table[f]
	d[x] = val
	nothing
end


"""
	_has(f::Function, x)
Check if argument `x` for function `f` is already in the `_master_table`.
"""
function _has(f::Function, x)::Bool
	d = _master_table[f]
	return haskey(d, x)
end

"""
	_max_arg(f::Function)
Find the largest argument known for `f`. Note that `f` must be a function
of just a single value.
"""
function _max_arg(f::Function)
	tab = _master_table[f]
	return maximum(keys(tab))
end


"""
	_get(f::Function, x)
Retrieve the function value `f(x)` from the `_master_table`.
"""
function _get(f::Function, x)::BigInt
	d = _master_table[f]
	return d[x]
end


"""
	_make(f::Function, T::Type)
Create an entry in the `_master_table` for the function `f`.
"""
function _make(f::Function, T::Type)
	_master_table[f] = Dict{T, BigInt}()
	nothing
end

function Binomial(n::Integer, k::Integer)::BigInt
	if _has(Binomial, n)
		return _get(Binomial, n)
	end

	val = binomial(big(n), big(k))::BigInt
	_save(Binomial, n, val)

	return _get(Binomial, n)
end

function Multinomial(vals::Vector{T})::BigInt where {T <: Integer}
	if any([t < 0 for t in vals])
		throw(DomainError(vals, "arguments must be nonnegative"))
	end

  vals = sort(vals)

	nv = length(vals)
	n = sum(vals)
	# base cases
	if nv <= 1 || n == 0
		return big(1)
	end

  key = join(vals, ",")
	if _has(Multinomial, key)
		return _get(Multinomial, key)
	end

	result = Binomial(n, vals[end]) * Multinomial(vals[1:nv-1])
	_save(Multinomial, key, result)
	# reduce
	return _get(Multinomial, key)
end

UPPER_LIMIT = @show length(string((BigInt(2)^8)^1024))

# n = [0:256;]

# fn1(x) = ncr(1024-x, x) * BigInt(128) ^ (1024-4x) * 78341 ^ (x)
# fn2(x) = ncr(1024-x, x) * BigInt(128) ^ (1024-3x) * 42451 ^ (x)
# fn3(x) = ncr(1024-x, x) * BigInt(128) ^ (1024-2x) * 1863 ^ (x)

# @show sum(fn1.([1:256;])) + sum(fn2.([1:341;])) + sum(fn3.([1:512;]))
_make(Binomial, Integer)
_make(Multinomial, String)

SUM = BigInt(0)

for i in 1:1024
	for j in 0:512
		if 2j > i
			break
		end
		@show i, j
		for k in 0:341
			if 2j + 3k > i
				break
			end
			for l in 0:256
				if 2j + 3k + 4l > i
					break
				end

				# global SUM += 128^i * 1863^j * 42451^k * 78341^l * ncr(1024, i) * ncr(1024-i, j) * ncr(1024-i-j, k) * ncr(1024-i-j-k, l)
				global SUM += Multinomial([i - 2j - 3k - 4l, j, k, l]) * BigInt(128)^(i - 2j - 3k - 4l) * BigInt(1863)^j * BigInt(42451)^k * BigInt(78341)^l
			end
		end
	end
end


@show SUM
